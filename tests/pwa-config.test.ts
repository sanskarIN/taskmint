import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

const viteConfig = readRepositoryFile('vite.config.ts');
const promptSource = readRepositoryFile('src/components/PwaUpdatePrompt.tsx');
const mainSource = readRepositoryFile('src/main.tsx');
const packageJson = JSON.parse(readRepositoryFile('package.json')) as {
  devDependencies?: Record<string, string>;
};

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
