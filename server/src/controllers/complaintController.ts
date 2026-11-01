import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../socket.js';

const complaintSchema = z.object({
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'CLEANING', 'SECURITY', 'MAINTENANCE', 'OTHER']),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).default('MEDIUM'),
});

export const createComplaint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = complaintSchema.parse(req.body);
    const userId = req.user!.id;
    let flatId = req.user!.flatId;
    let societyId = req.user!.societyId;

    if (!flatId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { flat: true },
      });
      flatId = user?.flatId;
      societyId = user?.flat?.societyId || societyId;
    }

    if (!flatId || !societyId) {
      res.status(400).json({ success: false, message: 'Resident must have an assigned flat to lodge complaints' });
      return;
    }

    // Generate unique ticket number
    const ticketNumber = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        societyId,
        flatId,
        userId,
        category: data.category,
        subject: data.subject.trim(),
        description: data.description.trim(),
        priority: data.priority,
        status: 'OPEN',
      },
      include: {
        flat: true,
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    // Notify admins via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`society-${societyId}`).emit('complaint:new', complaint);
    }

    res.status(201).json({
      success: true,
      message: `Helpdesk ticket ${ticketNumber} created successfully`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, category, priority, search } = req.query as {
      status?: string;
      category?: string;
      priority?: string;
      search?: string;
    };

    const userRole = req.user!.role;
    const userId = req.user!.id;
    const societyId = req.user!.societyId;

    let whereClause: any = {};

    if (userRole === 'RESIDENT') {
      whereClause.userId = userId;
    } else if (societyId) {
      whereClause.societyId = societyId;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status.toUpperCase();
    }
    if (category && category !== 'ALL') {
      whereClause.category = category.toUpperCase();
    }
    if (priority && priority !== 'ALL') {
      whereClause.priority = priority.toUpperCase();
    }
    if (search) {
      whereClause.OR = [
        { ticketNumber: { contains: search } },
        { subject: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        flat: true,
        user: { select: { id: true, name: true, phone: true } },
        comments: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        flat: { include: { building: true } },
        user: { select: { id: true, name: true, phone: true, email: true } },
        comments: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint ticket not found' });
      return;
    }

    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

export const addComplaintComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { message } = req.body;
    const user = req.user!;

    if (!message || message.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Message cannot be empty' });
      return;
    }

    const comment = await prisma.complaintComment.create({
      data: {
        complaintId: id,
        userId: user.id,
        authorName: user.name,
        authorRole: user.role,
        message: message.trim(),
      },
    });

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, assignedStaffName, resolutionNotes } = req.body;

    const dataToUpdate: any = {};
    if (status) {
      dataToUpdate.status = status;
      if (status === 'RESOLVED') {
        dataToUpdate.resolvedAt = new Date();
      }
    }
    if (assignedStaffName !== undefined) {
      dataToUpdate.assignedStaffName = assignedStaffName;
    }
    if (resolutionNotes !== undefined) {
      dataToUpdate.resolutionNotes = resolutionNotes;
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: dataToUpdate,
      include: {
        flat: true,
        user: { select: { id: true, name: true } },
      },
    });

    // Notify resident
    await prisma.notification.create({
      data: {
        userId: updated.userId,
        title: `Ticket ${updated.ticketNumber} Updated`,
        message: `Status changed to ${updated.status}${updated.assignedStaffName ? `. Assigned to: ${updated.assignedStaffName}` : ''}`,
        type: 'COMPLAINT',
        link: '/resident/helpdesk',
      },
    });

    const io = getIO();
    if (io) {
      io.to(`user-${updated.userId}`).emit('complaint:updated', updated);
    }

    res.json({ success: true, message: 'Ticket updated successfully', complaint: updated });
  } catch (error) {
    next(error);
  }
};
