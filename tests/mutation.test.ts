import { describe, expect, it, vi } from 'vitest';
import { runExclusiveMutation } from '../src/utils/mutation';

describe('runExclusiveMutation', () => {
  it('rejects competing work without entering the second action', async () => {
    const lock = { current: false };
    const busy = vi.fn();
    let release: (() => void) | undefined;
    const firstAction = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      })
    );
    const secondAction = vi.fn().mockResolvedValue(undefined);

    const first = runExclusiveMutation(lock, busy, firstAction);
    const second = runExclusiveMutation(lock, busy, secondAction);

    await expect(second).resolves.toBe(false);
    expect(secondAction).not.toHaveBeenCalled();
    expect(lock.current).toBe(true);
    expect(busy).toHaveBeenCalledTimes(1);
    expect(busy).toHaveBeenLastCalledWith(true);

    release?.();
    await expect(first).resolves.toBe(true);
    expect(lock.current).toBe(false);
    expect(busy.mock.calls).toEqual([[true], [false]]);
  });

  it('can surface a safe caller-provided busy error for submissions that must retry', async () => {
    const lock = { current: true };
    const busy = vi.fn();
    const action = vi.fn().mockResolvedValue(undefined);

    await expect(runExclusiveMutation(lock, busy, action, 'Task action already in progress.')).rejects.toThrow(
      'Task action already in progress.'
    );
    expect(action).not.toHaveBeenCalled();
    expect(busy).not.toHaveBeenCalled();
  });

  it('always releases the gate after an action fails', async () => {
    const lock = { current: false };
    const busy = vi.fn();

    await expect(
      runExclusiveMutation(lock, busy, async () => {
        throw new Error('simulated persistence failure');
      })
    ).rejects.toThrow(/simulated persistence failure/i);

    expect(lock.current).toBe(false);
    expect(busy.mock.calls).toEqual([[true], [false]]);
  });

  it('releases the lock even if entering the busy state throws', async () => {
    const lock = { current: false };
    const action = vi.fn().mockResolvedValue(undefined);
    const busy = vi.fn((value: boolean) => {
      if (value) throw new Error('simulated busy-state failure');
    });

    await expect(runExclusiveMutation(lock, busy, action)).rejects.toThrow(/busy-state failure/i);
    expect(action).not.toHaveBeenCalled();
    expect(lock.current).toBe(false);
    expect(busy.mock.calls).toEqual([[true], [false]]);
  });
});
