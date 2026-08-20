import { isTauri } from '@tauri-apps/api/core';

export function isNativeApp(): boolean {
  return isTauri();
}
