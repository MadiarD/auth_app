import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
  },
  server: {
    allowedHosts: ['...','.gim38.kz','217.114.10.194'],
  },
  envPrefix: 'VITE_',
});
