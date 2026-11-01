import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../socket.js';

export const getBills = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, year } = req.query as { status?: string; year?: string };
    const userRole = req.user!.role;
    const userFlatId = req.user!.flatId;
    const societyId = req.user!.societyId;

    let whereClause: any = {};

    if (userRole === 'RESIDENT') {
      if (userFlatId) {
        whereClause.flatId = userFlatId;
      } else {
        whereClause.userId = req.user!.id;
      }
    } else if (societyId) {
      whereClause.societyId = societyId;
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (year) {
      whereClause.billingYear = parseInt(year, 10);
    }

    const bills = await prisma.maintenanceBill.findMany({
      where: whereClause,
      include: {
        flat: {
          include: { building: true },
        },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute summary metrics
    const totalPending = bills
      .filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const totalPaid = bills
      .filter((b) => b.status === 'PAID')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({
      success: true,
      count: bills.length,
      metrics: {
        totalPending,
        totalPaid,
        pendingCount: bills.filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE').length,
      },
      bills,
    });
  } catch (error) {
    next(error);
  }
};

export const getBillById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const bill = await prisma.maintenanceBill.findUnique({
      where: { id },
      include: {
        flat: {
          include: { building: true, society: true },
        },
        items: true,
        payments: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!bill) {
      res.status(404).json({ success: false, message: 'Maintenance bill not found' });
      return;
    }

    res.json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

const payBillSchema = z.object({
  paymentMethod: z.enum(['UPI', 'CARD', 'NETBANKING', 'CASH', 'CHEQUE']).default('UPI'),
  mockSuccess: z.boolean().default(true),
});

export const payBill = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { paymentMethod, mockSuccess } = payBillSchema.parse(req.body);

    const bill = await prisma.maintenanceBill.findUnique({
      where: { id },
      include: { flat: true },
    });

    if (!bill) {
      res.status(404).json({ success: false, message: 'Maintenance bill not found' });
      return;
    }

    if (bill.status === 'PAID') {
      res.status(400).json({ success: false, message: 'This bill has already been paid in full' });
      return;
    }

    // In local sandbox / demo mode: verify status on server
    const isSuccess = mockSuccess !== false;
    const txnRef = `${paymentMethod}/TXN-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isSuccess) {
      await prisma.payment.create({
        data: {
          billId: bill.id,
          amount: bill.totalAmount,
          method: paymentMethod,
          transactionRef: txnRef,
          status: 'FAILED',
          gatewayResponse: 'Mock gateway bank declined simulation',
        },
      });

      res.status(402).json({
        success: false,
        message: 'Payment simulation declined by issuer bank.',
        transactionRef: txnRef,
      });
      return;
    }

    // Process success
    const receiptNumber = `REC-${bill.billingYear}-${bill.id.slice(-6).toUpperCase()}`;

    const [updatedBill, payment] = await prisma.$transaction([
      prisma.maintenanceBill.update({
        where: { id: bill.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentMethod,
          transactionId: txnRef,
          receiptUrl: `/api/maintenance/receipts/${bill.id}`,
        },
      }),
      prisma.payment.create({
        data: {
          billId: bill.id,
          amount: bill.totalAmount,
          method: paymentMethod,
          transactionRef: txnRef,
          status: 'SUCCESS',
          gatewayResponse: 'Sandbox Mock Payment Authorized 200 OK',
        },
      }),
      prisma.auditLog.create({
        data: {
          societyId: bill.societyId,
          userId: req.user?.id,
          action: 'BILL_PAID',
          entityType: 'MaintenanceBill',
          entityId: bill.id,
          details: `Bill ${bill.billNumber} of ₹${bill.totalAmount} paid via ${paymentMethod} (${txnRef})`,
        },
      }),
    ]);

    // Create confirmation notification
    if (bill.userId) {
      await prisma.notification.create({
        data: {
          userId: bill.userId,
          title: 'Payment Received — Thank You!',
          message: `Payment of ₹${bill.totalAmount.toLocaleString('en-IN')} for ${bill.billingMonth} recorded successfully. Txn Ref: ${txnRef}`,
          type: 'MAINTENANCE',
          link: '/resident/maintenance',
        },
      });
    }

    const io = getIO();
    if (io) {
      io.to(`society-${bill.societyId}`).emit('dashboard:update', { type: 'BILL_PAID', billId: bill.id });
    }

    res.json({
      success: true,
      message: `Payment of ₹${bill.totalAmount.toLocaleString('en-IN')} processed successfully!`,
      bill: updatedBill,
      payment,
      receiptNumber,
    });
  } catch (error) {
    next(error);
  }
};

export const createBill = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { flatId, billingMonth, billingYear, dueDate, items } = req.body;
    const societyId = req.user!.societyId;

    if (!societyId) {
      res.status(400).json({ success: false, message: 'Society ID required' });
      return;
    }

    const flat = await prisma.flat.findUnique({
      where: { id: flatId },
      include: { users: { where: { role: 'RESIDENT' } } },
    });

    if (!flat) {
      res.status(404).json({ success: false, message: 'Flat not found' });
      return;
    }

    const totalAmount = items.reduce((sum: number, it: any) => sum + Number(it.amount), 0);
    const billNumber = `BILL-${billingYear}-${Date.now().toString().slice(-4)}-${flat.flatNumber.replace(/[^A-Za-z0-9]/g, '')}`;

    const newBill = await prisma.maintenanceBill.create({
      data: {
        societyId,
        flatId: flat.id,
        userId: flat.users[0]?.id || null,
        billNumber,
        billingMonth,
        billingYear: parseInt(billingYear, 10) || 2026,
        dueDate: new Date(dueDate),
        totalAmount,
        status: 'PENDING',
        items: {
          create: items.map((it: any) => ({
            title: it.title,
            amount: Number(it.amount),
            category: it.category || 'MAINTENANCE',
          })),
        },
      },
      include: { items: true, flat: true },
    });

    res.status(201).json({ success: true, message: 'Bill generated successfully', bill: newBill });
  } catch (error) {
    next(error);
  }
};
