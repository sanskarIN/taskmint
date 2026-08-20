export interface MutationLock {
  current: boolean;
}

export async function runExclusiveMutation(
  lock: MutationLock,
  setBusy: (busy: boolean) => void,
  action: () => Promise<void>,
  busyError?: string
): Promise<boolean> {
  if (lock.current) {
    if (busyError) throw new Error(busyError);
    return false;
  }

  lock.current = true;
  try {
    setBusy(true);
    await action();
    return true;
  } finally {
    lock.current = false;
    setBusy(false);
  }
}
