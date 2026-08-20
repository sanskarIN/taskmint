import { fail } from '../domain/errors';
import { downloadText } from '../utils/export';
import { isNativeApp } from './runtime';

interface TextFileFilter {
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
    downloadText(filename, content, mimeType);
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
