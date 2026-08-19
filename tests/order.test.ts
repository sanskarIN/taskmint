import { describe, expect, it } from 'vitest';
import { nextTaskOrder } from '../src/domain/order';

describe('task order allocation', () => {
  it('allocates the first order from the configured step', () => {
    expect(nextTaskOrder([])).toBe(1000);
  });

  it('uses the highest existing order without relying on argument spreading', () => {
    const tasks = Array.from({ length: 100_000 }, (_, index) => ({ order: index * 1000 }));
    expect(nextTaskOrder(tasks)).toBe(100_000_000);
  });

  it('supports a custom positive order step', () => {
    expect(nextTaskOrder([{ order: 10 }, { order: 50 }, { order: 20 }], 25)).toBe(75);
  });
});
