import { Server } from 'socket.io';
import { env } from './env.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from './database.js';
import * as ordersService from '../services/orders.service.js';

let io = null;

const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

// Support additional origins via env var (comma-separated)
if (process.env.ADDITIONAL_CORS_ORIGINS) {
  process.env.ADDITIONAL_CORS_ORIGINS.split(',').forEach(origin => {
    const trimmed = origin.trim();
    if (trimmed) allowedOrigins.push(trimmed);
  });
}

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Admin dashboard joins restaurant room (JWT auth)
    socket.on('join:restaurant', (data, callback) => {
      try {
        const { restaurantId, token } = data;
        const decoded = verifyAccessToken(token);
        socket.join(`restaurant:${restaurantId}`);
        console.log(`Admin joined restaurant:${restaurantId}`);
        if (callback) callback({ success: true });
      } catch (err) {
        console.error('join:restaurant auth failed:', err.message);
        if (callback) callback({ success: false, error: 'Authentication failed' });
      }
    });

    // KDS joins kitchen room (PIN auth)
    socket.on('join:kitchen', async (data, callback) => {
      try {
        const { restaurantId, pin } = data;
        const settings = await prisma.settings.findUnique({
          where: { restaurantId },
        });

        if (!settings || !settings.kitchenPin || settings.kitchenPin !== pin) {
          if (callback) callback({ success: false, error: 'Invalid PIN' });
          return;
        }

        socket.join(`kitchen:${restaurantId}`);
        console.log(`Kitchen joined kitchen:${restaurantId}`);

        // Return active orders on successful join
        const orders = await ordersService.getAll(restaurantId, {});
        const activeOrders = orders.filter(o =>
          !['completed', 'cancelled', 'rejected'].includes(o.status)
        );

        if (callback) callback({ success: true, orders: activeOrders });
      } catch (err) {
        console.error('join:kitchen failed:', err.message);
        if (callback) callback({ success: false, error: 'Verification failed' });
      }
    });

    // Public customer joins for order tracking (no auth)
    socket.on('join:public', (data, callback) => {
      const { restaurantId } = data;
      socket.join(`public:${restaurantId}`);
      console.log(`Public client joined public:${restaurantId}`);
      if (callback) callback({ success: true });
    });

    // KDS status update via socket
    socket.on('order:updateStatus', async (data, callback) => {
      try {
        const { restaurantId, orderId, status } = data;
        const order = await ordersService.updateStatus(restaurantId, orderId, status);

        // Broadcast to all rooms
        io.to(`restaurant:${restaurantId}`).emit('order:updated', order);
        io.to(`kitchen:${restaurantId}`).emit('order:updated', order);
        io.to(`public:${restaurantId}`).emit('order:updated', order);

        if (callback) callback({ success: true, order });
      } catch (err) {
        console.error('order:updateStatus failed:', err.message);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Public customer calls staff (no auth, ephemeral)
    socket.on('staff:call', async (data, callback) => {
      try {
        const { restaurantId, tableNumber, customerName } = data;
        if (!restaurantId || !tableNumber) {
          if (callback) callback({ success: false, error: 'Missing restaurantId or tableNumber' });
          return;
        }

        const settings = await prisma.settings.findUnique({
          where: { restaurantId },
        });

        if (!settings || !settings.allowCallStaff) {
          if (callback) callback({ success: false, error: 'Call staff is not enabled' });
          return;
        }

        io.to(`restaurant:${restaurantId}`).emit('staff:called', {
          tableNumber,
          customerName: customerName || null,
          timestamp: new Date().toISOString(),
        });

        console.log(`Staff called for table ${tableNumber} at restaurant ${restaurantId}`);
        if (callback) callback({ success: true });
      } catch (err) {
        console.error('staff:call failed:', err.message);
        if (callback) callback({ success: false, error: 'Failed to call staff' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log('WebSocket server initialized');
  return io;
};

export const getIO = () => io;
