import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketIOServer | null = null;

const JWT_SECRET = process.env.JWT_SECRET || 'resisync_super_secret_jwt_key_2026_production';

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (token && typeof token === 'string') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        socket.data.user = decoded;
      } catch (err) {
        // Allow unauthenticated connection for public kiosk/scanner if needed
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    if (user) {
      socket.join(`user-${user.id}`);
      if (user.role === 'SECURITY') {
        socket.join('guards');
      }
    }

    socket.on('join-society', (societyId: string) => {
      if (societyId) {
        socket.join(`society-${societyId}`);
        if (user?.role === 'SECURITY') {
          socket.join(`society-${societyId}-guards`);
        }
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};

