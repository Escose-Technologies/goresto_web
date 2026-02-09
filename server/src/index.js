import http from 'http';
import { env } from '../config/env.js';
import { initializeSocket } from '../config/socket.js';
import app from '../app.js';

const PORT = env.PORT;

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`WebSocket server running on port ${PORT}`);
});
