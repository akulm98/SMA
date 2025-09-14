import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/stock-quote': {
        target: 'http://localhost:54321/functions/v1/stock-quote',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stock-quote/, ''),
      },
    },
  },
});