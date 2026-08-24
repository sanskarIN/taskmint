import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTask } from '../src/domain/task';

const nativeState = vi.hoisted(() => ({ enabled: true }));
const notificationPlugin = vi.hoisted(() => ({
  isPermissionGranted: vi.fn(),
  requestPermission: vi.fn(),
  sendNotification: vi.fn()
}));

vi.mock('../src/platform/runtime', () => ({
  isNativeApp: () => nativeState.enabled
}));
vi.mock('@tauri-apps/plugin-notification', () => ({
  isPermissionGranted: notificationPlugin.isPermissionGranted,
  requestPermission: notificationPlugin.requestPermission,
  sendNotification: notificationPlugin.sendNotification
}));

import { notifyDueTasks, requestNotificationPermission } from '../src/utils/notifications';

beforeEach(() => {
  nativeState.enabled = true;
  vi.clearAllMocks();
  notificationPlugin.isPermissionGranted.mockResolvedValue(true);
  notificationPlugin.requestPermission.mockResolvedValue('granted');
});

describe('native reminders', () => {
  it('uses an existing operating-system notification grant without prompting', async () => {
    await expect(requestNotificationPermission()).resolves.toBe(true);

    expect(notificationPlugin.isPermissionGranted).toHaveBeenCalledTimes(1);
    expect(notificationPlugin.requestPermission).not.toHaveBeenCalled();
  });

  it('requests permission when the native grant is not already present', async () => {
    notificationPlugin.isPermissionGranted.mockResolvedValue(false);
    notificationPlugin.requestPermission.mockResolvedValue('granted');

    await expect(requestNotificationPermission()).resolves.toBe(true);
    expect(notificationPlugin.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('reports a denied native notification request', async () => {
    notificationPlugin.isPermissionGranted.mockResolvedValue(false);
    notificationPlugin.requestPermission.mockResolvedValue('denied');

    await expect(requestNotificationPermission()).resolves.toBe(false);
  });

  it('sends a due task through the native notification plugin and marks it delivered', async () => {
    const task = createTask(
      { title: 'Native reminder', reminderAt: '2026-08-23T06:00:00.000Z' },
      new Date('2026-08-23T05:00:00.000Z'),
      1000
    );

    const notified = await notifyDueTasks(
      [task],
      new Set(),
      new Date('2026-08-23T07:00:00.000Z')
    );

    expect(notificationPlugin.sendNotification).toHaveBeenCalledWith({
      title: 'TaskMint reminder',
      body: 'Native reminder'
    });
    expect(notified.has(task.id)).toBe(true);
  });

  it('does not send or mark reminders when native permission is unavailable', async () => {
    notificationPlugin.isPermissionGranted.mockResolvedValue(false);
    const task = createTask(
      { title: 'Permission required', reminderAt: '2026-08-23T06:00:00.000Z' },
      new Date('2026-08-23T05:00:00.000Z'),
      1000
    );

    const notified = await notifyDueTasks(
      [task],
      new Set(),
      new Date('2026-08-23T07:00:00.000Z')
    );

    expect(notificationPlugin.sendNotification).not.toHaveBeenCalled();
    expect(notified.has(task.id)).toBe(false);
  });
});
