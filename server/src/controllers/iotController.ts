import { Response, NextFunction } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { getIO } from '../socket.js';

export const getIoTDevices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const societyId = req.user!.societyId;
    const devices = await prisma.ioTDevice.findMany({
      where: societyId ? { societyId } : {},
      include: {
        readings: {
          orderBy: { recordedAt: 'desc' },
          take: 5,
        },
      },
    });

    // Provide historical 24h trends for charts
    const hourlyHistory = [
      { time: '00:00', power: 32.1, water: 88, aqi: 45, parkingOccupancy: 40 },
      { time: '03:00', power: 26.4, water: 86, aqi: 40, parkingOccupancy: 42 },
      { time: '06:00', power: 41.2, water: 82, aqi: 52, parkingOccupancy: 41 },
      { time: '09:00', power: 58.7, water: 71, aqi: 68, parkingOccupancy: 28 },
      { time: '12:00', power: 52.3, water: 65, aqi: 62, parkingOccupancy: 30 },
      { time: '15:00', power: 49.0, water: 74, aqi: 59, parkingOccupancy: 32 },
      { time: '18:00', power: 64.8, water: 76, aqi: 74, parkingOccupancy: 39 },
      { time: '21:00', power: 56.2, water: 78, aqi: 65, parkingOccupancy: 42 },
    ];

    res.json({
      success: true,
      mode: process.env.MOCK_IOT === 'true' ? 'DEMO_SIMULATION' : 'LIVE_GATEWAY',
      isDemoMode: true,
      lastTelemetrySync: new Date().toISOString(),
      devices,
      history: hourlyHistory,
      systemHealth: {
        power: { status: 'OPTIMAL', text: 'Grid Online (48.6 kW)', unit: 'kW', value: 48.6 },
        water: { status: 'NORMAL', text: 'Overhead Tanks 78%', unit: '%', value: 78.4 },
        security: { status: 'ARMED', text: '100% Cams & Boom Online', unit: 'ANPR', value: 100 },
        airQuality: { status: 'MODERATE', text: 'AQI 58 (Good)', unit: 'AQI', value: 58 },
        parking: { status: 'NORMAL', text: '18 Bays Available (70% Occupied)', unit: '%', value: 70 },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSensorReading = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { deviceId, sensorType, metricValue, unit, status } = req.body;

    const newReading = await prisma.sensorReading.create({
      data: {
        deviceId,
        sensorType,
        metricValue: Number(metricValue),
        unit,
        status: status || 'NORMAL',
      },
    });

    const io = getIO();
    if (io) {
      io.emit('iot:reading', newReading);
    }

    res.status(201).json({ success: true, reading: newReading });
  } catch (error) {
    next(error);
  }
};

