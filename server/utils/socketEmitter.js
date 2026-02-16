import { getIO } from '../config/socket.js';

export const emitOrderCreated = (restaurantId, order) => {
  try {
    const io = getIO();
    if (!io) return;
    io.to(`restaurant:${restaurantId}`).emit('order:new', order);
    io.to(`kitchen:${restaurantId}`).emit('order:new', order);
  } catch (err) {
    // Silent fail — socket may not be available in serverless
    console.error('emitOrderCreated error:', err.message);
  }
};

export const emitOrderUpdated = (restaurantId, order) => {
  try {
    const io = getIO();
    if (!io) return;
    io.to(`restaurant:${restaurantId}`).emit('order:updated', order);
    io.to(`kitchen:${restaurantId}`).emit('order:updated', order);
    io.to(`public:${restaurantId}`).emit('order:updated', order);
  } catch (err) {
    console.error('emitOrderUpdated error:', err.message);
  }
};

export const emitBillCreated = (restaurantId, bill) => {
  try {
    const io = getIO();
    if (!io) return;
    io.to(`restaurant:${restaurantId}`).emit('bill:new', bill);
  } catch (err) {
    console.error('emitBillCreated error:', err.message);
  }
};

export const emitBillUpdated = (restaurantId, bill) => {
  try {
    const io = getIO();
    if (!io) return;
    io.to(`restaurant:${restaurantId}`).emit('bill:updated', bill);
  } catch (err) {
    console.error('emitBillUpdated error:', err.message);
  }
};
