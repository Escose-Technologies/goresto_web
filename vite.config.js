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

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
  define: {
    'import.meta.env.VITE_NETWORK_IP': JSON.stringify(networkIP),
  },
  build: {
    outDir: 'dist',
  },
})

