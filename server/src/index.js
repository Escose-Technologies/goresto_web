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

// Graceful shutdown for Docker
const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
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
