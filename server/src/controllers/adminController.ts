import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getFlats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const societyId = req.user!.societyId;
    const flats = await prisma.flat.findMany({
      where: societyId ? { societyId } : {},
      include: {
        building: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            avatarUrl: true,
          },
        },
        residentProfiles: true,
        maintenanceBills: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { flatNumber: 'asc' },
    });

    res.json({ success: true, count: flats.length, flats });
  } catch (error) {
    next(error);
  }
};

export const createFlat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { flatNumber, floorNumber, buildingId, bhkType, sqFt, status } = req.body;
    const societyId = req.user!.societyId;

    if (!societyId) {
      res.status(400).json({ success: false, message: 'Society ID required' });
      return;
    }

    let bId = buildingId;
    if (!bId) {
      const b = await prisma.building.findFirst({ where: { societyId } });
      bId = b?.id;
    }

    const flat = await prisma.flat.create({
      data: {
        flatNumber: flatNumber.toUpperCase().trim(),
        floorNumber: Number(floorNumber) || 1,
        buildingId: bId,
        societyId,
        bhkType: bhkType || '3 BHK',
        sqFt: Number(sqFt) || 1400,
        status: status || 'VACANT',
      },
      include: { building: true },
    });

    res.status(201).json({ success: true, message: 'Flat created', flat });
  } catch (error) {
    next(error);
  }
};

export const getResidents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const societyId = req.user!.societyId;
    const residents = await prisma.user.findMany({
      where: {
        role: 'RESIDENT',
        ...(societyId && {
          flat: { societyId },
        }),
      },
      include: {
        flat: {
          include: { building: true },
        },
        residentProfile: true,
        familyMembers: true,
        vehicles: true,
      },
      orderBy: { name: 'asc' },
    });

    const safeResidents = residents.map(({ password, ...u }) => u);
    res.json({ success: true, count: safeResidents.length, residents: safeResidents });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const societyId = req.user!.societyId;
    const logs = await prisma.auditLog.findMany({
      where: societyId ? { societyId } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ success: true, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId: req.user!.id, isRead: false },
        data: { isRead: true },
      });
      res.json({ success: true, message: 'All notifications marked as read' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ success: true, notification: updated });
  } catch (error) {
    next(error);
  }
};
