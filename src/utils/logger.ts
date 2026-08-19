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
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[TaskMint] ${event}`, { message });
}
