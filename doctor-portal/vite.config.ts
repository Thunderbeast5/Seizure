import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    port: 5173, // keep the same port as CRA if desired, or let Vite use 5173
  },
  build: {
    outDir: 'build', // CRA uses 'build', Vite defaults to 'dist'. We'll keep 'build' to avoid breaking deployment scripts.
  }
});
