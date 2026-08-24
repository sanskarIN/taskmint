import { isReminderDue } from '../domain/task';
import type { Task } from '../domain/types';
import { strings } from '../i18n/en';
import { isNativeApp } from '../platform/runtime';

export const REMINDER_NOTIFICATION_BATCH = 5;

interface ReminderDelivery {
  body: string;
  tag: string;
}

type NotificationSender = (title: string, delivery: ReminderDelivery) => void;

export async function requestNotificationPermission(): Promise<boolean> {
  if (isNativeApp()) {
    const { isPermissionGranted, requestPermission } = await import(
      '@tauri-apps/plugin-notification'
    );
    if (await isPermissionGranted()) return true;
    return (await requestPermission()) === 'granted';
  }

  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

export async function notifyDueTasks(
  tasks: Task[],
  notifiedIds: Set<string>,
  now = new Date()
): Promise<Set<string>> {
  const next = new Set(notifiedIds);
  const sender = await resolveNotificationSender();
  if (!sender) return next;

  const due = tasks.filter((task) => !next.has(task.id) && isReminderDue(task, now));
  const individual = due.slice(0, REMINDER_NOTIFICATION_BATCH);
  const summarized = due.slice(REMINDER_NOTIFICATION_BATCH);

  for (const task of individual) {
    try {
      sender(strings.reminderNotificationTitle, {
        body: task.title,
        tag: `taskmint-${task.id}`
      });
      next.add(task.id);
    } catch {
      // Notification delivery is best-effort. Keep the ID unmarked so a later check can retry.
    }
  }

  if (summarized.length > 0) {
    try {
      sender(strings.reminderNotificationTitle, {
        body: strings.reminderSummaryBody(summarized.length),
        tag: 'taskmint-reminder-summary'
      });
      for (const task of summarized) next.add(task.id);
    } catch {
      // Keep summarized IDs unmarked so the batch can be retried later.
    }
  }

  return next;
}

async function resolveNotificationSender(): Promise<NotificationSender | null> {
  if (isNativeApp()) {
    const { isPermissionGranted, sendNotification } = await import(
      '@tauri-apps/plugin-notification'
    );
    if (!(await isPermissionGranted())) return null;
    return (title, delivery) => sendNotification({ title, body: delivery.body });
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') return null;
  return (title, delivery) =>
    new Notification(title, {
      body: delivery.body,
      icon: '/taskmint-icon.svg',
      tag: delivery.tag
    });
}
