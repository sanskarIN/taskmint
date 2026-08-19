import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTask } from '../src/domain/task';
import { notifyDueTasks } from '../src/utils/notifications';

class FakeNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn(async () => 'granted' as NotificationPermission);
  static calls: Array<{ title: string; options?: NotificationOptions }> = [];

  constructor(title: string, options?: NotificationOptions) {
    FakeNotification.calls.push({ title, options });
  }
}

class ThrowingNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn(async () => 'granted' as NotificationPermission);

  constructor() {
    throw new Error('Notification delivery failed');
  }
}

afterEach(() => {
  FakeNotification.calls = [];
  vi.unstubAllGlobals();
});

describe('browser reminders', () => {
  it('delivers a due task once and marks it as notified', () => {
    vi.stubGlobal('Notification', FakeNotification);
    const task = createTask(
      { title: 'Remember this', reminderAt: '2026-08-19T09:00:00.000Z' },
      new Date('2026-08-19T08:00:00.000Z'),
      1000
    );

    const notified = notifyDueTasks([task], new Set(), new Date('2026-08-19T10:00:00.000Z'));
    expect(notified.has(task.id)).toBe(true);
    expect(FakeNotification.calls).toHaveLength(1);
    expect(FakeNotification.calls[0]).toMatchObject({
      title: 'TaskMint reminder',
      options: { body: 'Remember this', tag: `taskmint-${task.id}` }
    });

    notifyDueTasks([task], notified, new Date('2026-08-19T10:01:00.000Z'));
    expect(FakeNotification.calls).toHaveLength(1);
  });

  it('does not let a notification constructor failure break reminder checks', () => {
    vi.stubGlobal('Notification', ThrowingNotification);
    const task = createTask(
      { title: 'Retry later', reminderAt: '2026-08-19T09:00:00.000Z' },
      new Date('2026-08-19T08:00:00.000Z'),
      1000
    );

    expect(() =>
      notifyDueTasks([task], new Set(), new Date('2026-08-19T10:00:00.000Z'))
    ).not.toThrow();
    expect(notifyDueTasks([task], new Set(), new Date('2026-08-19T10:00:00.000Z'))).not.toContain(
      task.id
    );
  });
});
