import type {
  ProductivityStats,
  Recurrence,
  SmartView,
  Task,
  TaskDraft,
  TaskFilters
} from './types';

const priorityRank: Record<Task['priority'], number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4
};

export function createTask(draft: TaskDraft, now = new Date(), order = Date.now()): Task {
  const title = normalizeTitle(draft.title);
  if (!title) throw new Error('Task title is required.');
  if (title.length > 240) throw new Error('Task title must be 240 characters or fewer.');

  const iso = now.toISOString();
  return {
    id: createId(),
    title,
    notes: (draft.notes ?? '').trim(),
    priority: draft.priority ?? 'medium',
    dueDate: normalizeDate(draft.dueDate),
    reminderAt: normalizeDateTime(draft.reminderAt),
    tags: normalizeTags(draft.tags ?? []),
    project: (draft.project ?? '').trim().slice(0, 80),
    recurrence: draft.recurrence ?? 'none',
    status: 'active',
    completedAt: null,
    archivedAt: null,
    createdAt: iso,
    updatedAt: iso,
    order
  };
}

export function updateTask(task: Task, draft: TaskDraft, now = new Date()): Task {
  const title = normalizeTitle(draft.title);
  if (!title) throw new Error('Task title is required.');
  return {
    ...task,
    title: title.slice(0, 240),
    notes: (draft.notes ?? '').trim(),
    priority: draft.priority ?? task.priority,
    dueDate: normalizeDate(draft.dueDate),
    reminderAt: normalizeDateTime(draft.reminderAt),
    tags: normalizeTags(draft.tags ?? []),
    project: (draft.project ?? '').trim().slice(0, 80),
    recurrence: draft.recurrence ?? task.recurrence,
    updatedAt: now.toISOString()
  };
}

export function completeTask(task: Task, now = new Date()): { completed: Task; next: Task | null } {
  const completed: Task = {
    ...task,
    status: 'completed',
    completedAt: now.toISOString(),
    archivedAt: null,
    updatedAt: now.toISOString()
  };
  return { completed, next: makeNextOccurrence(completed, now) };
}

export function reopenTask(task: Task, now = new Date()): Task {
  return {
    ...task,
    status: 'active',
    completedAt: null,
    archivedAt: null,
    updatedAt: now.toISOString()
  };
}

export function archiveTask(task: Task, now = new Date()): Task {
  return {
    ...task,
    status: 'archived',
    archivedAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export function restoreTask(task: Task, now = new Date()): Task {
  return {
    ...task,
    status: task.completedAt ? 'completed' : 'active',
    archivedAt: null,
    updatedAt: now.toISOString()
  };
}

export function makeNextOccurrence(task: Task, now = new Date()): Task | null {
  if (task.recurrence === 'none') return null;
  const base = task.dueDate ? parseLocalDate(task.dueDate) : startOfDay(now);
  const nextDue = addRecurrence(base, task.recurrence);
  return {
    ...task,
    id: createId(),
    dueDate: formatLocalDate(nextDue),
    reminderAt: moveReminder(task.reminderAt, task.dueDate, nextDue),
    status: 'active',
    completedAt: null,
    archivedAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    order: Date.now()
  };
}

export function addRecurrence(date: Date, recurrence: Exclude<Recurrence, 'none'>): Date {
  const result = new Date(date);
  if (recurrence === 'daily') result.setDate(result.getDate() + 1);
  if (recurrence === 'weekly') result.setDate(result.getDate() + 7);
  if (recurrence === 'monthly') {
    const day = result.getDate();
    result.setDate(1);
    result.setMonth(result.getMonth() + 1);
    const last = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(day, last));
  }
  return result;
}

export function filterAndSortTasks(tasks: Task[], filters: TaskFilters, now = new Date()): Task[] {
  const query = filters.search.trim().toLocaleLowerCase();
  const today = formatLocalDate(now);
  const filtered = tasks.filter((task) => {
    if (!matchesView(task, filters.view, today)) return false;
    if (filters.project && task.project !== filters.project) return false;
    if (filters.tag && !task.tags.includes(filters.tag)) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (!query) return true;
    const haystack = [task.title, task.notes, task.project, ...task.tags].join(' ').toLocaleLowerCase();
    return haystack.includes(query);
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case 'created-desc':
        return b.createdAt.localeCompare(a.createdAt);
      case 'due-asc':
        return (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31');
      case 'priority-desc':
        return priorityRank[b.priority] - priorityRank[a.priority];
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'manual':
      default:
        return a.order - b.order;
    }
  });
}

export function calculateStats(tasks: Task[], now = new Date()): ProductivityStats {
  const today = formatLocalDate(now);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const active = tasks.filter((t) => t.status === 'active').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const completed = completedTasks.length;
  const considered = active + completed;
  return {
    active,
    completed,
    archived: tasks.filter((t) => t.status === 'archived').length,
    overdue: tasks.filter((t) => t.status === 'active' && t.dueDate && t.dueDate < today).length,
    dueToday: tasks.filter((t) => t.status === 'active' && t.dueDate === today).length,
    completionRate: considered === 0 ? 0 : Math.round((completed / considered) * 100),
    completedLast7Days: completedTasks.filter((t) => {
      if (!t.completedAt) return false;
      return new Date(t.completedAt) >= sevenDaysAgo;
    }).length
  };
}

export function isReminderDue(task: Task, now = new Date()): boolean {
  return task.status === 'active' && !!task.reminderAt && new Date(task.reminderAt) <= now;
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function matchesView(task: Task, view: SmartView, today: string): boolean {
  switch (view) {
    case 'inbox':
      return task.status === 'active' && !task.project;
    case 'today':
      return task.status === 'active' && task.dueDate === today;
    case 'upcoming':
      return task.status === 'active' && !!task.dueDate && task.dueDate > today;
    case 'overdue':
      return task.status === 'active' && !!task.dueDate && task.dueDate < today;
    case 'completed':
      return task.status === 'completed';
    case 'archived':
      return task.status === 'archived';
    case 'all':
    default:
      return true;
  }
}

function normalizeTitle(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function normalizeDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeTags(tags: string[]): string[] {
  const normalized = tags.map((tag) => tag.trim().toLocaleLowerCase()).filter(Boolean);
  return [...new Set(normalized)].slice(0, 12).map((tag) => tag.slice(0, 32));
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function moveReminder(reminderAt: string | null, oldDueDate: string | null, nextDue: Date): string | null {
  if (!reminderAt) return null;
  const reminder = new Date(reminderAt);
  if (!oldDueDate || Number.isNaN(reminder.getTime())) return null;
  const oldDue = parseLocalDate(oldDueDate);
  const offset = reminder.getTime() - oldDue.getTime();
  return new Date(nextDue.getTime() + offset).toISOString();
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
