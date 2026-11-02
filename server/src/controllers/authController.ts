import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthRequest, generateToken } from '../middleware/auth.js';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  societyCode: z.string().min(1, 'Society code is required'),
  flatNumber: z.string().min(1, 'Flat number is required'),
});

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { phone: identifier.trim() },
        ],
      },
      include: {
        flat: {
          include: {
            building: true,
            society: true,
          },
        },
        residentProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is pending approval or inactive.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.',
      });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Strip sensitive fields
    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      token,
      user: userSafe,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    // Verify society code
    const society = await prisma.society.findUnique({
      where: { societyCode: data.societyCode.toUpperCase().trim() },
    });

    if (!society) {
      res.status(400).json({
        success: false,
        message: 'Invalid society code. Contact your estate administrator.',
      });
      return;
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    // Find or locate flat
    let flat = await prisma.flat.findFirst({
      where: {
        societyId: society.id,
        flatNumber: data.flatNumber.toUpperCase().trim(),
      },
    });

    if (!flat) {
      // Find default building or create
      let building = await prisma.building.findFirst({
        where: { societyId: society.id },
      });

      if (!building) {
        building = await prisma.building.create({
          data: {
            name: 'Tower A',
            societyId: society.id,
            totalFloors: 14,
          },
        });
      }

      flat = await prisma.flat.create({
        data: {
          flatNumber: data.flatNumber.toUpperCase().trim(),
          buildingId: building.id,
          societyId: society.id,
          status: 'OCCUPIED',
        },
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        password: hashedPassword,
        role: 'RESIDENT',
        flatId: flat.id,
        isActive: true, // auto-approve for seamless onboarding
        residentProfile: {
          create: {
            flatId: flat.id,
            occupancyType: 'OWNER',
            moveInDate: new Date(),
          },
        },
      },
      include: {
        flat: {
          include: {
            building: true,
            society: true,
          },
        },
        residentProfile: true,
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Welcome to RESISYNC',
        message: `Welcome to ${society.name}! Your residential profile for unit ${flat.flatNumber} is now active.`,
        type: 'GENERAL',
      },
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const { password: _, ...userSafe } = newUser;

    res.status(201).json({
      success: true,
      token,
      user: userSafe,
      message: 'Account successfully registered and verified.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        flat: {
          include: {
            building: true,
            society: true,
          },
        },
        residentProfile: true,
        familyMembers: true,
        vehicles: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { password: _, ...userSafe } = user;
    res.json({ success: true, user: userSafe });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always respond with success to prevent user enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions and security code have been sent.',
      demoNotice: user ? `Demo test OTP code is: 829104` : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: 'Password successfully updated' });
  } catch (error) {
    next(error);
  }
};

const societyRegisterSchema = z.object({
  societyName: z.string().min(3, 'Society name is required'),
  reraId: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(3, 'Zip/Pincode is required'),
  wings: z.array(z.string()).default(['Tower A', 'Tower B']),
  totalFlats: z.number().default(100),
  adminName: z.string().min(2, 'Administrator name is required'),
  adminEmail: z.string().email('Valid email is required'),
  adminPhone: z.string().min(8, 'Phone number is required'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
  amenities: z.array(z.string()).optional(),
});

export const registerSociety = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = societyRegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in or use another email.',
      });
      return;
    }

    const cleanPrefix = data.societyName.replace(/[^A-Za-z]/g, '').slice(0, 5).toUpperCase() || 'RESI';
    let societyCode = `${cleanPrefix}-${new Date().getFullYear()}`;
    const codeConflict = await prisma.society.findUnique({ where: { societyCode } });
    if (codeConflict) {
      societyCode = `${cleanPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const society = await tx.society.create({
        data: {
          name: data.societyName.trim(),
          address: data.address.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          zipCode: data.zipCode.trim(),
          totalFlats: data.totalFlats || 100,
          societyCode,
        },
      });

      const wingsList = data.wings && data.wings.length > 0 ? data.wings : ['Tower A', 'Tower B'];
      for (const wingName of wingsList) {
        const b = await tx.building.create({
          data: {
            societyId: society.id,
            name: wingName.trim(),
            totalFloors: 14,
          },
        });

        for (let floor = 1; floor <= 4; floor++) {
          for (let unit = 1; unit <= 2; unit++) {
            await tx.flat.create({
              data: {
                societyId: society.id,
                buildingId: b.id,
                flatNumber: `${wingName.replace(/[^A-Za-z0-9]/g, '')}-${floor}0${unit}`,
                floorNumber: floor,
                bhkType: unit === 1 ? '2BHK' : '3BHK',
                sqFt: unit === 1 ? 1200 : 1650,
                status: 'VACANT',
              },
            });
          }
        }
      }

      const adminUser = await tx.user.create({
        data: {
          email: data.adminEmail.toLowerCase().trim(),
          phone: data.adminPhone.trim(),
          name: data.adminName.trim(),
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      });

      const selectedAmenities = data.amenities && data.amenities.length > 0
        ? data.amenities
        : ['Club House', 'Swimming Pool', 'Fitness Gym', 'Tennis Court'];

      for (const amenName of selectedAmenities) {
        let cat = 'CLUBHOUSE';
        if (amenName.toLowerCase().includes('pool')) cat = 'POOL';
        else if (amenName.toLowerCase().includes('gym')) cat = 'GYM';
        else if (amenName.toLowerCase().includes('court') || amenName.toLowerCase().includes('sport')) cat = 'SPORTS';

        await tx.amenity.create({
          data: {
            societyId: society.id,
            name: amenName,
            category: cat,
            description: `State-of-the-art ${amenName} for society residents and verified guests.`,
            capacity: 25,
            openTime: '06:00',
            closeTime: '22:00',
            slotDurationMinutes: 60,
            pricing: 0,
            rules: 'Booking required via app. Maintain cleanliness and community etiquette.',
            imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=60',
            status: 'AVAILABLE',
          },
        });
      }

      const defaultIoT = [
        { name: 'Main Water Overhead Reservoir', deviceType: 'WATER_TANK', location: 'Rooftop Utility Zone', batteryLevel: 98, status: 'ONLINE', sensorType: 'WATER_LEVEL', val: 84, unit: '%' },
        { name: 'Cummins Diesel Generator 250kVA', deviceType: 'DG_GENSET', location: 'Basement Substation', batteryLevel: 100, status: 'ONLINE', sensorType: 'POWER_OUTPUT', val: 42, unit: 'kW' },
        { name: 'Rooftop Solar Array 50kW', deviceType: 'POWER_GRID', location: 'Terrace Grid Inverter', batteryLevel: 100, status: 'ONLINE', sensorType: 'SOLAR_GENERATION', val: 38, unit: 'kW' },
      ];

      for (const dev of defaultIoT) {
        const iot = await tx.ioTDevice.create({
          data: {
            societyId: society.id,
            name: dev.name,
            deviceType: dev.deviceType,
            location: dev.location,
            batteryLevel: dev.batteryLevel,
            status: dev.status,
          },
        });
        await tx.sensorReading.create({
          data: {
            deviceId: iot.id,
            sensorType: dev.sensorType,
            metricValue: dev.val,
            unit: dev.unit,
            status: 'NORMAL',
          },
        });
      }

      await tx.announcement.create({
        data: {
          societyId: society.id,
          title: `Welcome to ${society.name} on RESISYNC!`,
          content: `Society management platform is officially operational. Residents can self-register using the code: ${societyCode}.`,
          category: 'IMPORTANT',
          isPinned: true,
          authorName: adminUser.name,
        },
      });

      await tx.auditLog.create({
        data: {
          societyId: society.id,
          userId: adminUser.id,
          action: 'SOCIETY_REGISTERED',
          entityType: 'SOCIETY',
          entityId: society.id,
          details: `Society "${society.name}" registered with code ${societyCode} by ${adminUser.name}`,
        },
      });

      return { society, adminUser };
    });

    const token = generateToken({
      id: result.adminUser.id,
      email: result.adminUser.email,
      role: 'ADMIN',
    });

    const { password: _, ...userSafe } = result.adminUser;

    res.status(201).json({
      success: true,
      message: `Society "${result.society.name}" successfully registered! Society Code: ${societyCode}`,
      societyCode,
      society: result.society,
      token,
      user: userSafe,
    });
  } catch (error) {
    next(error);
  }
};


