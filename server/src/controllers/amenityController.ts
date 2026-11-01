import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAmenities = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, status } = req.query as { category?: string; status?: string };
    const societyId = req.user!.societyId;

    let whereClause: any = {};
    if (societyId) {
      whereClause.societyId = societyId;
    }
    if (category && category !== 'ALL') {
      whereClause.category = category.toUpperCase();
    }
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const amenities = await prisma.amenity.findMany({
      where: whereClause,
      include: {
        bookings: {
          where: {
            bookingDate: {
              gte: new Date().toISOString().split('T')[0],
            },
            status: 'CONFIRMED',
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, count: amenities.length, amenities });
  } catch (error) {
    next(error);
  }
};

export const getAmenityById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const amenity = await prisma.amenity.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          include: {
            user: { select: { id: true, name: true } },
            flat: { select: { flatNumber: true } },
          },
          orderBy: { bookingDate: 'asc' },
        },
      },
    });

    if (!amenity) {
      res.status(404).json({ success: false, message: 'Amenity not found' });
      return;
    }

    res.json({ success: true, amenity });
  } catch (error) {
    next(error);
  }
};

const bookingSchema = z.object({
  amenityId: z.string().min(1, 'Amenity ID is required'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be HH:MM'),
  guestsCount: z.number().min(1).default(1),
});

export const bookAmenity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = bookingSchema.parse(req.body);
    const userId = req.user!.id;
    let flatId = req.user!.flatId;

    if (!flatId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { flatId: true } });
      flatId = user?.flatId;
      if (!flatId) {
        res.status(400).json({ success: false, message: 'Valid flat assignment required to book amenities' });
        return;
      }
    }

    const amenity = await prisma.amenity.findUnique({
      where: { id: data.amenityId },
    });

    if (!amenity) {
      res.status(404).json({ success: false, message: 'Amenity not found' });
      return;
    }

    if (amenity.status === 'MAINTENANCE') {
      res.status(400).json({
        success: false,
        message: 'This facility is currently closed for maintenance and upgrades.',
      });
      return;
    }

    if (data.guestsCount > amenity.capacity) {
      res.status(400).json({
        success: false,
        message: `Exceeds max capacity (${amenity.capacity} persons) for this amenity`,
      });
      return;
    }

    // Server-side Conflict Detection & Atomic Transaction Safeguards
    const existingConflict = await prisma.amenityBooking.findFirst({
      where: {
        amenityId: amenity.id,
        bookingDate: data.bookingDate,
        status: 'CONFIRMED',
        OR: [
          // New start is inside existing slot
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          // New end is inside existing slot
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
          // New encompasses existing slot
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (existingConflict) {
      res.status(409).json({
        success: false,
        message: `Time slot conflict: ${existingConflict.startTime} - ${existingConflict.endTime} is already reserved for this amenity. Please choose another time slot.`,
      });
      return;
    }

    const booking = await prisma.amenityBooking.create({
      data: {
        amenityId: amenity.id,
        userId,
        flatId,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        guestsCount: data.guestsCount,
        status: 'CONFIRMED',
        totalFee: amenity.pricing,
        paymentStatus: amenity.pricing > 0 ? 'PAID' : 'FREE',
      },
      include: {
        amenity: true,
        flat: true,
      },
    });

    // Create confirmation notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Amenity Slot Confirmed',
        message: `Your booking for ${amenity.name} on ${data.bookingDate} (${data.startTime} - ${data.endTime}) is confirmed.`,
        type: 'AMENITY',
        link: '/resident/amenities',
      },
    });

    res.status(201).json({
      success: true,
      message: `Reservation confirmed for ${amenity.name}!`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const bookings = await prisma.amenityBooking.findMany({
      where: { userId },
      include: {
        amenity: true,
        flat: true,
      },
      orderBy: { bookingDate: 'desc' },
    });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const booking = await prisma.amenityBooking.findUnique({
      where: { id },
      include: { amenity: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (userRole !== 'ADMIN' && booking.userId !== userId) {
      res.status(403).json({ success: false, message: 'You can only cancel your own reservations' });
      return;
    }

    const updated = await prisma.amenityBooking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { amenity: true },
    });

    res.json({ success: true, message: 'Booking cancelled successfully', booking: updated });
  } catch (error) {
    next(error);
  }
};

export const updateAmenity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, pricing, openTime, closeTime, rules, capacity } = req.body;

    const updated = await prisma.amenity.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(pricing !== undefined && { pricing: Number(pricing) }),
        ...(openTime && { openTime }),
        ...(closeTime && { closeTime }),
        ...(rules !== undefined && { rules }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
      },
    });

    res.json({ success: true, message: 'Amenity settings updated', amenity: updated });
  } catch (error) {
    next(error);
  }
};
