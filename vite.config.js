import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// Override to point the dev proxy at another API (e.g. a test server).
const API_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:5000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // In development the frontend calls /api on its own origin and Vite forwards
  // it to the Express server — no CORS setup or hard-coded URLs needed.
  server: {
    proxy: {
      '/api': API_TARGET,
      '/uploads': API_TARGET,
      '/socket.io': { target: API_TARGET, ws: true },
    },
  },
});
