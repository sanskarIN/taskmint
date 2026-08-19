import { isReminderDue } from '../domain/task';
import type { Task } from '../domain/types';
import { strings } from '../i18n/en';

export const REMINDER_NOTIFICATION_BATCH = 5;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

export function notifyDueTasks(
  tasks: Task[],
  notifiedIds: Set<string>,
  now = new Date()
): Set<string> {
  const next = new Set(notifiedIds);
  if (!('Notification' in window) || Notification.permission !== 'granted') return next;

  const due = tasks.filter((task) => !next.has(task.id) && isReminderDue(task, now));
  const individual = due.slice(0, REMINDER_NOTIFICATION_BATCH);
  const summarized = due.slice(REMINDER_NOTIFICATION_BATCH);

  for (const task of individual) {
    try {
      new Notification(strings.reminderNotificationTitle, {
        body: task.title,
        icon: '/taskmint-icon.svg',
        tag: `taskmint-${task.id}`
      });
      next.add(task.id);
    } catch {
      // Notification delivery is best-effort. Keep the ID unmarked so a later check can retry.
    }
  }

  if (summarized.length > 0) {
    try {
      new Notification(strings.reminderNotificationTitle, {
        body: strings.reminderSummaryBody(summarized.length),
        icon: '/taskmint-icon.svg',
        tag: 'taskmint-reminder-summary'
      });
      for (const task of summarized) next.add(task.id);
    } catch {
      // Keep summarized IDs unmarked so the batch can be retried later.
    }
  }

  return next;
}
