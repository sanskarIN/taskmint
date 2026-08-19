import { TaskMintError } from '../domain/errors';

const blockedKeys = /password|token|secret|authorization|cookie|notes|title/i;

export function logEvent(event: string, metadata: Record<string, unknown> = {}): void {
  if (!import.meta.env.DEV) return;
  const safe = Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, blockedKeys.test(key) ? '[REDACTED]' : value])
  );
  console.info(`[TaskMint] ${event}`, safe);
}

export function logError(event: string, error: unknown): void {
  if (!import.meta.env.DEV) return;
  const diagnostic =
    error instanceof TaskMintError
      ? { kind: 'TaskMintError', code: error.code }
      : { kind: error instanceof Error ? 'Error' : 'Unknown' };
  console.error(`[TaskMint] ${event}`, diagnostic);
}
