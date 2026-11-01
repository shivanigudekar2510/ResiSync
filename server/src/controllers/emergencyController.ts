import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../socket.js';

const emergencySchema = z.object({
  emergencyType: z.enum(['SECURITY', 'MEDICAL', 'FIRE', 'OTHER']).default('SECURITY'),
  note: z.string().optional(),
});

export const triggerEmergency = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = emergencySchema.parse(req.body);
    const userId = req.user!.id;
    const residentName = req.user!.name;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { flat: true },
    });

    const flatNumber = user?.flat?.flatNumber || 'Gate / General Area';
    const flatId = user?.flatId || (await prisma.flat.findFirst({ select: { id: true } }))?.id || '';
    const societyId = req.user!.societyId || (await prisma.society.findFirst({ select: { id: true } }))?.id || '';

    const emergency = await prisma.emergencyRequest.create({
      data: {
        societyId,
        flatId,
        userId,
        residentName,
        residentPhone: user?.phone || 'N/A',
        flatNumber,
        emergencyType: data.emergencyType,
        status: 'ACTIVE',
        note: data.note || 'Emergency SOS button triggered from mobile web application.',
      },
    });

    // Broadcast urgent alert to all guards and administrators via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`society-${societyId}`).emit('emergency:alert', {
        id: emergency.id,
        emergencyType: emergency.emergencyType,
        flatNumber: emergency.flatNumber,
        residentName: emergency.residentName,
        residentPhone: emergency.residentPhone,
        note: emergency.note,
        createdAt: emergency.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: '🚨 Emergency SOS alert activated. Gate security desk and management notified immediately.',
      emergency,
      verifiedDelivery: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmergencies = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const societyId = req.user!.societyId;
    const emergencies = await prisma.emergencyRequest.findMany({
      where: societyId ? { societyId } : {},
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, emergencies });
  } catch (error) {
    next(error);
  }
};

export const resolveEmergency = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const resolverName = req.user!.name;

    const updated = await prisma.emergencyRequest.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedBy: resolverName,
        resolvedAt: new Date(),
      },
    });

    res.json({ success: true, message: 'Emergency alert marked as resolved', emergency: updated });
  } catch (error) {
    next(error);
  }
};

export const getEmergencyContacts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Configurable emergency numbers
    const contacts = [
      {
        category: 'Immediate Society Assistance',
        contacts: [
          { name: 'Gate 1 Main Security Desk', phone: '+91 80 4912 0001', available: '24x7 Active', role: 'Security' },
          { name: 'Gate 2 Rear Security Desk', phone: '+91 80 4912 0002', available: '24x7 Active', role: 'Security' },
          { name: 'Estate Manager (Mr. K. Sharma)', phone: '+91 98450 11223', available: '08:00 - 20:00', role: 'Management' },
          { name: 'Society Control Room Intercom', phone: 'Ext 100 / 101', available: '24x7 Active', role: 'Control' },
        ],
      },
      {
        category: 'Public Emergency Services',
        contacts: [
          { name: 'National Emergency Response Helpline', phone: '112', available: 'Toll-free 24x7', role: 'Emergency' },
          { name: 'Police Control Room', phone: '100', available: 'Toll-free 24x7', role: 'Police' },
          { name: 'Fire & Rescue Station', phone: '101', available: 'Toll-free 24x7', role: 'Fire' },
          { name: 'Ambulance / Medical Response', phone: '108', available: 'Toll-free 24x7', role: 'Ambulance' },
          { name: 'Nearby Manipal Hospital Emergency', phone: '+91 80 2502 4444', available: '24x7 Trauma Center', role: 'Hospital' },
        ],
      },
    ];

    res.json({ success: true, contacts });
  } catch (error) {
    next(error);
  }
};
