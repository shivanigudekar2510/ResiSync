import { Response, NextFunction } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, phone, avatarUrl, emergencyContactName, emergencyContactPhone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        residentProfile: {
          upsert: {
            create: {
              flatId: req.user!.flatId || '',
              emergencyContactName,
              emergencyContactPhone,
            },
            update: {
              ...(emergencyContactName !== undefined && { emergencyContactName }),
              ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
            },
          },
        },
      },
      include: {
        flat: { include: { building: true, society: true } },
        residentProfile: true,
        familyMembers: true,
        vehicles: true,
      },
    });

    const { password: _, ...safeUser } = updatedUser;
    res.json({ success: true, message: 'Profile updated successfully', user: safeUser });
  } catch (error) {
    next(error);
  }
};

export const addFamilyMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, relation, phone, age } = req.body;

    if (!name || !relation) {
      res.status(400).json({ success: false, message: 'Name and relation are required' });
      return;
    }

    const member = await prisma.familyMember.create({
      data: {
        userId,
        name: name.trim(),
        relation: relation.trim(),
        phone: phone?.trim() || null,
        age: age ? Number(age) : null,
      },
    });

    res.status(201).json({ success: true, message: 'Family member registered', member });
  } catch (error) {
    next(error);
  }
};

export const deleteFamilyMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    await prisma.familyMember.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'Family member removed' });
  } catch (error) {
    next(error);
  }
};

export const addVehicle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { vehicleType, vehicleNumber, parkingSlot, makeModel } = req.body;

    if (!vehicleNumber || !parkingSlot) {
      res.status(400).json({ success: false, message: 'Vehicle number and parking slot required' });
      return;
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        vehicleType: vehicleType || 'FOUR_WHEELER',
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        parkingSlot: parkingSlot.toUpperCase().trim(),
        makeModel: makeModel?.trim() || null,
      },
    });

    res.status(201).json({ success: true, message: 'Vehicle registered with RFID pass', vehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    await prisma.vehicle.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'Vehicle unregistered' });
  } catch (error) {
    next(error);
  }
};
