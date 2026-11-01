import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../socket.js';

export const getAnnouncements = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category } = req.query as { category?: string };
    const societyId = req.user!.societyId;

    let whereClause: any = {};
    if (societyId) {
      whereClause.societyId = societyId;
    }
    if (category && category !== 'ALL') {
      whereClause.category = category.toUpperCase();
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, category, isPinned } = req.body;
    const authorName = req.user!.name;
    const societyId = req.user!.societyId;

    if (!societyId) {
      res.status(400).json({ success: false, message: 'Society ID required' });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        societyId,
        title: title.trim(),
        content: content.trim(),
        category: category || 'GENERAL',
        isPinned: Boolean(isPinned),
        authorName,
      },
    });

    // Broadcast to society via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`society-${societyId}`).emit('announcement:new', announcement);
    }

    res.status(201).json({ success: true, message: 'Announcement broadcasted', announcement });
  } catch (error) {
    next(error);
  }
};

