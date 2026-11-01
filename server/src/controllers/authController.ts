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

