import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const tauriDevHost = process.env.TAURI_DEV_HOST;
const tauriPlatform = process.env.TAURI_ENV_PLATFORM;
const tauriDebug = Boolean(process.env.TAURI_ENV_DEBUG);

export default defineConfig({
  plugins: [
    {
      name: 'taskmint-dev-csp-relaxation',
      apply: 'serve',
      transformIndexHtml(html) {
        return html
          .replace("style-src 'self';", "style-src 'self' 'unsafe-inline';")
          .replace("connect-src 'self';", "connect-src 'self' ws: wss:;");
      }
    },
    react(),
    VitePWA({
      registerType: 'prompt',
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
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: tauriDevHost || false,
    hmr: tauriDevHost
      ? {
          protocol: 'ws',
          host: tauriDevHost,
          port: 1421
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    target: tauriPlatform ? (tauriPlatform === 'windows' ? 'chrome105' : 'safari13') : 'es2022',
    minify: tauriPlatform && tauriDebug ? false : 'esbuild',
    sourcemap: tauriPlatform ? tauriDebug : true,
    cssCodeSplit: true
  },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }
});
