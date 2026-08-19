import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['taskmint-icon.svg'],
      manifest: {
        name: 'TaskMint',
        short_name: 'TaskMint',
        description: 'Offline-first, privacy-friendly task manager.',
        theme_color: '#0f766e',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [{ src: '/taskmint-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: '/index.html'
      }
    })
  ],
  build: { target: 'es2022', sourcemap: true, cssCodeSplit: true },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }
});
