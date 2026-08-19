import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
const promptSource = readFileSync(
  new URL('../src/components/PwaUpdatePrompt.tsx', import.meta.url),
  'utf8'
);
const mainSource = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { devDependencies?: Record<string, string> };

describe('PWA update lifecycle', () => {
  it('keeps updates waiting instead of auto-reloading over unsaved task input', () => {
    expect(viteConfig).toContain("registerType: 'prompt'");
    expect(viteConfig).not.toContain("registerType: 'autoUpdate'");
  });

  it('uses the supported prompt runtime and explicit activation path', () => {
    expect(packageJson.devDependencies?.['workbox-window']).toBe('7.4.1');
    expect(promptSource).toContain("from 'virtual:pwa-register/react'");
    expect(promptSource).toContain('updateServiceWorker(true)');
    expect(mainSource).toContain('<PwaUpdatePrompt />');
  });
});
