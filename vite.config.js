import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
    port: 443,
    allowedHosts: ['...'],
  },
  envPrefix: 'VITE_',
});
