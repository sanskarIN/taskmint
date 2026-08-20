import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTask } from '../src/domain/task';
import { REMINDER_NOTIFICATION_BATCH, notifyDueTasks } from '../src/utils/notifications';

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

class SummaryThrowingNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn(async () => 'granted' as NotificationPermission);
  static calls: Array<{ title: string; options?: NotificationOptions }> = [];

  constructor(title: string, options?: NotificationOptions) {
    if (options?.tag === 'taskmint-reminder-summary') throw new Error('Summary delivery failed');
    SummaryThrowingNotification.calls.push({ title, options });
  }
}

afterEach(() => {
  FakeNotification.calls = [];
  SummaryThrowingNotification.calls = [];
});

describe('browser reminders', () => {
  it('delivers a due task once and marks it as notified', async () => {
    vi.stubGlobal('Notification', FakeNotification);
    const task = createTask(
      { title: 'Remember this', reminderAt: '2026-08-19T09:00:00.000Z' },
      new Date('2026-08-19T08:00:00.000Z'),
      1000
    );

    const notified = await notifyDueTasks(
      [task],
      new Set(),
      new Date('2026-08-19T10:00:00.000Z')
    );
    expect(notified.has(task.id)).toBe(true);
    expect(FakeNotification.calls).toHaveLength(1);
    expect(FakeNotification.calls[0]).toMatchObject({
      title: 'TaskMint reminder',
      options: { body: 'Remember this', tag: `taskmint-${task.id}` }
    });

    await notifyDueTasks([task], notified, new Date('2026-08-19T10:01:00.000Z'));
    expect(FakeNotification.calls).toHaveLength(1);
  });

  it('does not let a notification constructor failure break reminder checks', async () => {
    vi.stubGlobal('Notification', ThrowingNotification);
    const task = createTask(
      { title: 'Retry later', reminderAt: '2026-08-19T09:00:00.000Z' },
      new Date('2026-08-19T08:00:00.000Z'),
      1000
    );

    const notified = await notifyDueTasks(
      [task],
      new Set(),
      new Date('2026-08-19T10:00:00.000Z')
    );
    expect(notified.has(task.id)).toBe(false);
  });

  it('aggregates reminders beyond the individual batch limit', async () => {
    vi.stubGlobal('Notification', FakeNotification);
    const now = new Date('2026-08-19T10:00:00.000Z');
    const tasks = Array.from({ length: REMINDER_NOTIFICATION_BATCH + 7 }, (_, index) =>
      createTask(
        { title: `Due ${index}`, reminderAt: '2026-08-19T09:00:00.000Z' },
        new Date('2026-08-19T08:00:00.000Z'),
        index * 1000
      )
    );

    const notified = await notifyDueTasks(tasks, new Set(), now);

    expect(FakeNotification.calls).toHaveLength(REMINDER_NOTIFICATION_BATCH + 1);
    expect(FakeNotification.calls.at(-1)).toMatchObject({
      title: 'TaskMint reminder',
      options: {
        body: '7 more due reminders are waiting in TaskMint.',
        tag: 'taskmint-reminder-summary'
      }
    });
    expect(notified.size).toBe(tasks.length);
  });

  it('keeps summarized reminders retryable when the summary notification fails', async () => {
    vi.stubGlobal('Notification', SummaryThrowingNotification);
    const now = new Date('2026-08-19T10:00:00.000Z');
    const tasks = Array.from({ length: REMINDER_NOTIFICATION_BATCH + 2 }, (_, index) =>
      createTask(
        { title: `Due ${index}`, reminderAt: '2026-08-19T09:00:00.000Z' },
        new Date('2026-08-19T08:00:00.000Z'),
        index * 1000
      )
    );

    const notified = await notifyDueTasks(tasks, new Set(), now);

    expect(notified.size).toBe(REMINDER_NOTIFICATION_BATCH);
    expect(notified.has(tasks.at(-1)!.id)).toBe(false);
  });
});
