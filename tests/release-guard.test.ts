import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const releaseGuard = resolve('scripts/check-release.mjs');

async function withReleaseFixture(
  version: string,
  withLockfile: boolean,
  run: (directory: string) => void
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'taskmint-release-'));
  try {
    await writeFile(join(directory, 'package.json'), JSON.stringify({ version }), 'utf8');
    if (withLockfile) await writeFile(join(directory, 'package-lock.json'), '{}\n', 'utf8');
    run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function execute(directory: string, tag: string) {
  return spawnSync(process.execPath, [releaseGuard, tag], {
    cwd: directory,
    encoding: 'utf8'
  });
}

describe('release readiness guard', () => {
  it('passes only when the tag matches package.json and a lockfile exists', async () => {
    await withReleaseFixture('0.1.0', true, (directory) => {
      const result = execute(directory, 'v0.1.0');
      expect(result.status).toBe(0);
      expect(result.stdout).toMatch(/release readiness passed/i);
    });
  });

  it('fails when package-lock.json is missing', async () => {
    await withReleaseFixture('0.1.0', false, (directory) => {
      const result = execute(directory, 'v0.1.0');
      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/package-lock\.json is required/i);
    });
  });

  it('fails when the release tag does not match the package version', async () => {
    await withReleaseFixture('0.1.0', true, (directory) => {
      const result = execute(directory, 'v0.2.0');
      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/does not match package version 0\.1\.0/i);
    });
  });
});
