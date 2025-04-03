import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      '/iotapp': {
        target: 'https://moriahmkt.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/iotapp/, ''),
        secure: false // Solo para desarrollo, quitar en producción
      },
    },
  },
  plugins: [
    react(),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@mapbox/mapbox-gl-draw'] // Excluir si no se usa
  },
  build: {
    commonjsOptions: {
      include: [/mapbox-gl/, /node_modules/], // Soporte para CommonJS
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});