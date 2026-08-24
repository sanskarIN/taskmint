import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function text(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

const packageJson = JSON.parse(text('../package.json')) as {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const tauriConfig = JSON.parse(text('../src-tauri/tauri.conf.json')) as {
  identifier?: string;
  build?: { frontendDist?: string; devUrl?: string };
  app?: { security?: { csp?: string; freezePrototype?: boolean } };
};
const desktopCapability = JSON.parse(text('../src-tauri/capabilities/desktop.json')) as {
  platforms?: string[];
  permissions?: string[];
};
const mobileCapability = JSON.parse(text('../src-tauri/capabilities/mobile.json')) as {
  platforms?: string[];
  permissions?: string[];
};
const viteConfig = text('../vite.config.ts');
const indexHtml = text('../index.html');
const mainSource = text('../src/main.tsx');
const pwaPrompt = text('../src/components/PwaUpdatePrompt.tsx');
const windowsIcon = readFileSync(new URL('../src-tauri/icons/icon.ico', import.meta.url));

const requiredNativePermissions = [
  'core:default',
  'dialog:allow-open',
  'dialog:allow-save',
  'fs:allow-stat',
  'fs:allow-read-text-file',
  'fs:allow-write-text-file',
  'notification:allow-is-permission-granted',
  'notification:allow-request-permission',
  'notification:allow-notify',
  'opener:allow-open-url',
  'opener:allow-default-urls'
];
const forbiddenNativePermissions = [
  'shell:default',
  'notification:default',
  'opener:default',
  'opener:allow-open-path',
  'opener:allow-reveal-item-in-dir'
];

describe('native cross-platform configuration', () => {
  it('keeps the Tauri desktop and mobile commands/dependencies available', () => {
    expect(packageJson.scripts?.['tauri:dev']).toBe('tauri dev');
    expect(packageJson.scripts?.['tauri:build']).toBe('tauri build');
    expect(packageJson.scripts?.['tauri:android:init']).toBe('tauri android init');
    expect(packageJson.scripts?.['tauri:android:build']).toBe('tauri android build');
    expect(packageJson.scripts?.['tauri:ios:init']).toBe('tauri ios init');
    expect(packageJson.scripts?.['tauri:ios:build']).toBe('tauri ios build');
    expect(packageJson.dependencies?.['@tauri-apps/api']).toBeTruthy();
    expect(packageJson.devDependencies?.['@tauri-apps/cli']).toBeTruthy();
  });

  it('keeps native IPC permitted without weakening the web CSP globally', () => {
    expect(tauriConfig.identifier).toBe('in.sanskar.taskmint');
    expect(tauriConfig.build?.frontendDist).toBe('../dist');
    expect(tauriConfig.build?.devUrl).toBe('http://localhost:5173');
    expect(tauriConfig.app?.security?.csp).toContain('ipc:');
    expect(tauriConfig.app?.security?.csp).toContain('http://ipc.localhost');
    expect(tauriConfig.app?.security?.freezePrototype).toBe(true);
    expect(viteConfig).toContain("name: 'taskmint-native-csp'");
    expect(viteConfig).toContain("connect-src 'self' ipc: http://ipc.localhost;");
    expect(indexHtml).toContain("connect-src 'self';");
  });

  it('keeps least-privilege capabilities on desktop and mobile', () => {
    expect(desktopCapability.platforms).toEqual(['linux', 'macOS', 'windows']);
    expect(mobileCapability.platforms).toEqual(['iOS', 'android']);
    for (const permission of requiredNativePermissions) {
      expect(desktopCapability.permissions).toContain(permission);
      expect(mobileCapability.permissions).toContain(permission);
    }
    for (const permission of forbiddenNativePermissions) {
      expect(desktopCapability.permissions).not.toContain(permission);
      expect(mobileCapability.permissions).not.toContain(permission);
    }
  });

  it('keeps the Windows icon directory structurally complete', () => {
    expect(windowsIcon.readUInt16LE(0)).toBe(0);
    expect(windowsIcon.readUInt16LE(2)).toBe(1);
    const imageCount = windowsIcon.readUInt16LE(4);
    expect(imageCount).toBeGreaterThan(0);

    const directoryEnd = 6 + imageCount * 16;
    expect(windowsIcon.length).toBeGreaterThanOrEqual(directoryEnd);
    for (let index = 0; index < imageCount; index += 1) {
      const entryOffset = 6 + index * 16;
      const imageLength = windowsIcon.readUInt32LE(entryOffset + 8);
      const imageOffset = windowsIcon.readUInt32LE(entryOffset + 12);
      expect(imageLength).toBeGreaterThan(0);
      expect(imageOffset).toBeGreaterThanOrEqual(directoryEnd);
      expect(imageOffset + imageLength).toBeLessThanOrEqual(windowsIcon.length);
    }
  });

  it('keeps mobile safe-area and native/PWA runtime boundaries wired', () => {
    expect(indexHtml).toContain('viewport-fit=cover');
    expect(mainSource).toContain("import './platform.css';");
    expect(pwaPrompt).toContain('if (isNativeApp()) return null;');
  });
});
