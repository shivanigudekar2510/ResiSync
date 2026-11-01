import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../socket.js';

const inviteVisitorSchema = z.object({
  name: z.string().min(2, 'Visitor name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  visitorType: z.enum(['GUEST', 'DELIVERY', 'CAB', 'SERVICE', 'OTHER']).default('GUEST'),
  vehicleNumber: z.string().optional(),
  expectedAt: z.string().min(1, 'Expected date and time required'),
  purpose: z.string().optional(),
  notes: z.string().optional(),
  flatId: z.string().optional(),
});

export const inviteVisitor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = inviteVisitorSchema.parse(req.body);
    const userId = req.user!.id;
    let flatId = data.flatId || req.user!.flatId;

    if (!flatId) {
      // Find flat from resident profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { flatId: true, flat: { select: { societyId: true } } },
      });
      flatId = user?.flatId;
      if (!flatId) {
        res.status(400).json({ success: false, message: 'Resident must have an assigned flat to invite visitors' });
        return;
      }
    }

    const flat = await prisma.flat.findUnique({
      where: { id: flatId },
      include: { society: true },
    });

    if (!flat) {
      res.status(404).json({ success: false, message: 'Flat not found' });
      return;
    }

    // Generate 6-digit alphanumeric passcode and UUID QR token
    const passCode = Math.floor(100000 + Math.random() * 900000).toString();
    const qrToken = `resisync-pass-${uuidv4()}`;

    const visitor = await prisma.visitor.create({
      data: {
        societyId: flat.societyId,
        flatId: flat.id,
        invitedById: userId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        visitorType: data.visitorType,
        vehicleNumber: data.vehicleNumber ? data.vehicleNumber.toUpperCase().trim() : null,
        expectedAt: new Date(data.expectedAt),
        status: 'APPROVED',
        purpose: data.purpose?.trim() || 'Personal Visit',
        notes: data.notes?.trim() || null,
        passCode,
        qrToken,
      },
      include: {
        flat: true,
        invitedBy: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    // Notify Security Guard via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`society-${flat.societyId}-guards`).emit('visitor:new', visitor);
      io.to(`society-${flat.societyId}`).emit('dashboard:update', { type: 'VISITOR_INVITED' });
    }

    res.status(201).json({
      success: true,
      message: 'Visitor pass created successfully',
      visitor,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tab, search, flatId } = req.query as { tab?: string; search?: string; flatId?: string };
    const userRole = req.user!.role;
    const userId = req.user!.id;
    const userFlatId = req.user!.flatId;
    const societyId = req.user!.societyId;

    let whereClause: any = {};

    // Role-based visibility
    if (userRole === 'RESIDENT') {
      if (userFlatId) {
        whereClause.flatId = userFlatId;
      } else {
        whereClause.invitedById = userId;
      }
    } else if (societyId) {
      whereClause.societyId = societyId;
      if (flatId) {
        whereClause.flatId = flatId;
      }
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { passCode: { contains: search } },
        { vehicleNumber: { contains: search } },
      ];
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (tab === 'today') {
      whereClause.expectedAt = {
        gte: startOfToday,
        lte: endOfToday,
      };
    } else if (tab === 'upcoming') {
      whereClause.expectedAt = {
        gt: endOfToday,
      };
      whereClause.status = {
        in: ['EXPECTED', 'APPROVED'],
      };
    } else if (tab === 'history') {
      whereClause.status = {
        in: ['CHECKED_OUT', 'REJECTED', 'CANCELLED'],
      };
    } else if (tab === 'inside') {
      whereClause.status = 'CHECKED_IN';
    }

    const visitors = await prisma.visitor.findMany({
      where: whereClause,
      include: {
        flat: true,
        invitedBy: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { expectedAt: 'desc' },
    });

    res.json({ success: true, count: visitors.length, visitors });
  } catch (error) {
    next(error);
  }
};

export const verifyPass = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const code = req.params.code as string;
    if (!code) {
      res.status(400).json({ success: false, message: 'Pass code or QR token is required' });
      return;
    }

    const visitor = await prisma.visitor.findFirst({
      where: {
        OR: [
          { passCode: code.trim() },
          { qrToken: code.trim() },
        ],
      },
      include: {
        flat: {
          include: {
            building: true,
          },
        },
        invitedBy: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!visitor) {
      res.status(404).json({ success: false, message: 'Invalid or unrecognized visitor pass' });
      return;
    }

    res.json({ success: true, visitor });
  } catch (error) {
    next(error);
  }
};

export const checkInVisitor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const guardId = req.user!.id;

    const visitor = await prisma.visitor.findUnique({
      where: { id },
      include: { flat: true, invitedBy: true },
    });

    if (!visitor) {
      res.status(404).json({ success: false, message: 'Visitor record not found' });
      return;
    }

    if (visitor.status === 'CHECKED_IN') {
      res.status(400).json({ success: false, message: 'Visitor is already checked in' });
      return;
    }

    if (visitor.status === 'CHECKED_OUT') {
      res.status(400).json({ success: false, message: 'Pass has already expired / visitor already checked out' });
      return;
    }

    if (visitor.status === 'CANCELLED' || visitor.status === 'REJECTED') {
      res.status(400).json({ success: false, message: `Pass is ${visitor.status.toLowerCase()} and cannot be used` });
      return;
    }

    const updated = await prisma.visitor.update({
      where: { id },
      data: {
        status: 'CHECKED_IN',
        checkInTime: new Date(),
        checkedInByGuardId: guardId,
      },
      include: { flat: true, invitedBy: true },
    });

    // Notify resident if available
    if (visitor.invitedById) {
      await prisma.notification.create({
        data: {
          userId: visitor.invitedById,
          title: 'Visitor Arrived at Gate',
          message: `${visitor.name} (${visitor.visitorType}) has been checked in by Security.`,
          type: 'VISITOR',
          link: '/resident/visitors',
        },
      });
    }

    const io = getIO();
    if (io) {
      io.to(`user-${visitor.invitedById}`).emit('visitor:status_changed', {
        visitorId: updated.id,
        status: 'CHECKED_IN',
        visitor: updated,
      });
      io.to(`society-${visitor.societyId}`).emit('dashboard:update', { type: 'VISITOR_CHECKED_IN' });
    }

    res.json({
      success: true,
      message: `Checked in ${updated.name} for unit ${visitor.flat?.flatNumber || ''}`,
      visitor: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const checkOutVisitor = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const guardId = req.user!.id;

    const visitor = await prisma.visitor.findUnique({ where: { id } });
    if (!visitor) {
      res.status(404).json({ success: false, message: 'Visitor record not found' });
      return;
    }

    if (visitor.status !== 'CHECKED_IN') {
      res.status(400).json({ success: false, message: 'Visitor is not currently inside' });
      return;
    }

    const updated = await prisma.visitor.update({
      where: { id },
      data: {
        status: 'CHECKED_OUT',
        checkOutTime: new Date(),
        checkedOutByGuardId: guardId,
      },
      include: { flat: true, invitedBy: true },
    });

    const io = getIO();
    if (io) {
      io.to(`society-${visitor.societyId}`).emit('dashboard:update', { type: 'VISITOR_CHECKED_OUT' });
    }

    res.json({
      success: true,
      message: `Checked out ${updated.name}`,
      visitor: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisitorStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const updated = await prisma.visitor.update({
      where: { id },
      data: { status },
      include: { flat: true, invitedBy: true },
    });

    const io = getIO();
    if (io) {
      io.to(`society-${updated.societyId}-guards`).emit('visitor:status_changed', updated);
    }

    res.json({ success: true, message: `Visitor invitation ${status.toLowerCase()}`, visitor: updated });
  } catch (error) {
    next(error);
  }
};
