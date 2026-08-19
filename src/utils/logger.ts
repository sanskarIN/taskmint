import { TaskMintError } from '../domain/errors';

const blockedKeys = /password|token|secret|authorization|cookie|notes|title/i;
const safeIdentifierKey = /^(?:id|[A-Za-z][A-Za-z0-9]*(?:Id|ID)|[a-z][a-z0-9_]*_id)$/;
const safeIdentifier = /^[A-Za-z0-9._:-]{1,128}$/;

export function logEvent(event: string, metadata: Record<string, unknown> = {}): void {
  if (!import.meta.env.DEV) return;
  const safe = Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, sanitizeEventValue(key, value)])
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

function sanitizeEventValue(key: string, value: unknown): unknown {
  if (blockedKeys.test(key)) return '[REDACTED]';
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (
    typeof value === 'string' &&
    safeIdentifierKey.test(key) &&
    safeIdentifier.test(value)
  ) {
    return value;
  }
  return '[REDACTED]';
}
