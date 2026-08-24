import { beforeEach, describe, expect, it, vi } from 'vitest';

const nativeState = vi.hoisted(() => ({ enabled: true }));
const dialog = vi.hoisted(() => ({
  open: vi.fn(),
  save: vi.fn()
}));
const filesystem = vi.hoisted(() => ({
  readTextFile: vi.fn(),
  stat: vi.fn(),
  writeTextFile: vi.fn()
}));

vi.mock('../src/platform/runtime', () => ({
  isNativeApp: () => nativeState.enabled
}));
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: dialog.open,
  save: dialog.save
}));
vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: filesystem.readTextFile,
  stat: filesystem.stat,
  writeTextFile: filesystem.writeTextFile
}));

import { pickTextFile, saveTextFile } from '../src/platform/files';

const filter = { name: 'TaskMint JSON', extensions: ['json'] };

beforeEach(() => {
  nativeState.enabled = true;
  vi.clearAllMocks();
});

describe('native text file adapter', () => {
  it('writes only after the user selects a save path', async () => {
    dialog.save.mockResolvedValue('/tmp/taskmint.json');
    filesystem.writeTextFile.mockResolvedValue(undefined);

    await expect(
      saveTextFile('taskmint.json', '{"ok":true}', 'application/json', filter)
    ).resolves.toBe(true);

    expect(dialog.save).toHaveBeenCalledWith({
      defaultPath: 'taskmint.json',
      filters: [filter]
    });
    expect(filesystem.writeTextFile).toHaveBeenCalledWith('/tmp/taskmint.json', '{"ok":true}');
  });

  it('does not write when the native save dialog is cancelled', async () => {
    dialog.save.mockResolvedValue(null);

    await expect(
      saveTextFile('taskmint.json', '{}', 'application/json', filter)
    ).resolves.toBe(false);

    expect(filesystem.writeTextFile).not.toHaveBeenCalled();
  });

  it('returns null when the native open dialog is cancelled', async () => {
    dialog.open.mockResolvedValue(null);

    await expect(pickTextFile(filter, 1024)).resolves.toBeNull();
    expect(filesystem.stat).not.toHaveBeenCalled();
    expect(filesystem.readTextFile).not.toHaveBeenCalled();
  });

  it('reads a selected regular file after checking its size', async () => {
    dialog.open.mockResolvedValue('/tmp/taskmint.json');
    filesystem.stat.mockResolvedValue({ isFile: true, size: 12 });
    filesystem.readTextFile.mockResolvedValue('{"tasks":[]}');

    await expect(pickTextFile(filter, 1024)).resolves.toBe('{"tasks":[]}');

    expect(filesystem.stat).toHaveBeenCalledWith('/tmp/taskmint.json');
    expect(filesystem.readTextFile).toHaveBeenCalledWith('/tmp/taskmint.json');
  });

  it('rejects an oversized native import before reading file contents', async () => {
    dialog.open.mockResolvedValue('/tmp/oversized.json');
    filesystem.stat.mockResolvedValue({ isFile: true, size: 2048 });

    await expect(pickTextFile(filter, 1024)).rejects.toMatchObject({
      name: 'TaskMintError',
      code: 'import-file-too-large'
    });
    expect(filesystem.readTextFile).not.toHaveBeenCalled();
  });

  it('does not read a selected path that is not a regular file', async () => {
    dialog.open.mockResolvedValue('/tmp/folder');
    filesystem.stat.mockResolvedValue({ isFile: false, size: 0 });

    await expect(pickTextFile(filter, 1024)).resolves.toBeNull();
    expect(filesystem.readTextFile).not.toHaveBeenCalled();
  });
});
