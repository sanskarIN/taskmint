import { isReminderDue } from '../domain/task';
import type { Task } from '../domain/types';
import { strings } from '../i18n/en';

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

  for (const task of tasks) {
    if (next.has(task.id) || !isReminderDue(task, now)) continue;
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
  return next;
}
