import http from 'http';
import { env } from '../config/env.js';
import { initializeSocket } from '../config/socket.js';
import { prisma } from '../config/database.js';
import app from '../app.js';

const PORT = env.PORT;

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`WebSocket server running on port ${PORT}`);
});

// Cleanup expired refresh tokens every 6 hours
const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000;
const cleanupExpiredTokens = async () => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      console.log(`Cleaned up ${result.count} expired refresh tokens`);
    }
  } catch (err) {
    console.error('Token cleanup failed:', err.message);
  }
};
const cleanupTimer = setInterval(cleanupExpiredTokens, CLEANUP_INTERVAL);
// Run once on startup after a short delay
setTimeout(cleanupExpiredTokens, 10000);

// Graceful shutdown for Docker
const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  clearInterval(cleanupTimer);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Exiting.');
    process.exit(0);
  });
  // Force exit after 10 seconds if connections won't close
  setTimeout(() => {
    console.error('Could not close connections in time, forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
