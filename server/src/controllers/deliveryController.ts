import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../socket.js';

const deliverySchema = z.object({
  flatNumber: z.string().min(1, 'Flat number is required'),
  company: z.string().min(1, 'Delivery company is required'),
  trackingNumber: z.string().optional(),
  deliveryPersonName: z.string().optional(),
  phone: z.string().optional(),
});

export const createDelivery = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = deliverySchema.parse(req.body);
    const guardId = req.user!.id;
    const societyId = req.user!.societyId;

    if (!societyId) {
      res.status(400).json({ success: false, message: 'Society ID required' });
      return;
    }

    const flat = await prisma.flat.findFirst({
      where: {
        societyId,
        flatNumber: data.flatNumber.toUpperCase().trim(),
      },
      include: {
        users: {
          where: { role: 'RESIDENT' },
        },
      },
    });

    if (!flat) {
      res.status(404).json({ success: false, message: `Flat ${data.flatNumber} not found` });
      return;
    }

    const delivery = await prisma.delivery.create({
      data: {
        societyId,
        flatId: flat.id,
        company: data.company.trim(),
        trackingNumber: data.trackingNumber?.trim() || null,
        deliveryPersonName: data.deliveryPersonName?.trim() || null,
        phone: data.phone?.trim() || null,
        status: 'AT_GATE',
        guardId,
      },
      include: {
        flat: true,
      },
    });

    // Notify flat residents
    for (const resident of flat.users) {
      await prisma.notification.create({
        data: {
          userId: resident.id,
          title: 'Package at Gate',
          message: `${delivery.company} delivery arrived at Security Gate for your unit ${flat.flatNumber}.`,
          type: 'VISITOR',
          link: '/resident/dashboard',
        },
      });

      const io = getIO();
      if (io) {
        io.to(`user-${resident.id}`).emit('notification:new', {
          title: 'Package at Gate',
          message: `${delivery.company} parcel has arrived at the gate!`,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Delivery recorded for unit ${flat.flatNumber}`,
      delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, flatId } = req.query as { status?: string; flatId?: string };
    const userRole = req.user!.role;
    const userFlatId = req.user!.flatId;
    const societyId = req.user!.societyId;

    let whereClause: any = {};

    if (userRole === 'RESIDENT') {
      if (userFlatId) {
        whereClause.flatId = userFlatId;
      }
    } else if (societyId) {
      whereClause.societyId = societyId;
      if (flatId) {
        whereClause.flatId = flatId;
      }
    }

    if (status) {
      whereClause.status = status;
    }

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      include: { flat: true },
      orderBy: { gateEntryTime: 'desc' },
    });

    res.json({ success: true, count: deliveries.length, deliveries });
  } catch (error) {
    next(error);
  }
};

export const markDeliveryCollected = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updated = await prisma.delivery.update({
      where: { id },
      data: {
        status: 'COLLECTED',
        collectedTime: new Date(),
      },
      include: { flat: true },
    });

    res.json({ success: true, message: 'Delivery marked as collected', delivery: updated });
  } catch (error) {
    next(error);
  }
};
