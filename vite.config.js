import { execSync } from 'child_process';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// Function to get network IP (dev only)
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const networkIP = getNetworkIP();

const appVersion = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev';
  }
})();

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_NETWORK_IP': JSON.stringify(networkIP),
    // Surfaced in feedback reports so a bug can be tied to a specific build.
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
  optimizeDeps: {
    include: ['@emotion/styled', '@mui/material', '@mui/x-data-grid'],
  },
  build: {
    outDir: 'dist',
  },
})

