import { fail } from '../domain/errors';
import { isNativeApp } from './runtime';

export interface TextFileFilter {
  name: string;
  extensions: string[];
}

export async function saveTextFile(
  filename: string,
  content: string,
  mimeType: string,
  filter: TextFileFilter
): Promise<boolean> {
  if (!isNativeApp()) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  }

  const [{ save }, { writeTextFile }] = await Promise.all([
    import('@tauri-apps/plugin-dialog'),
    import('@tauri-apps/plugin-fs')
  ]);
  const path = await save({ defaultPath: filename, filters: [filter] });
  if (!path) return false;
  await writeTextFile(path, content);
  return true;
}

export async function pickTextFile(
  filter: TextFileFilter,
  maxBytes: number
): Promise<string | null> {
  if (!isNativeApp()) return null;

  const [{ open }, { readTextFile, stat }] = await Promise.all([
    import('@tauri-apps/plugin-dialog'),
    import('@tauri-apps/plugin-fs')
  ]);
  const path = await open({ multiple: false, directory: false, filters: [filter] });
  if (!path) return null;

  const metadata = await stat(path);
  if (!metadata.isFile) return null;
  if (metadata.size > maxBytes) fail('import-file-too-large');
  return readTextFile(path);
}
