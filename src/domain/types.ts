export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type TaskStatus = 'active' | 'completed' | 'archived';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SortMode = 'manual' | 'created-desc' | 'due-asc' | 'priority-desc' | 'title-asc';
export type SmartView = 'inbox' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'archived' | 'all';

export interface Task {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  dueDate: string | null;
  reminderAt: string | null;
  tags: string[];
  project: string;
  recurrence: Recurrence;
  status: TaskStatus;
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface TaskDraft {
  title: string;
  notes?: string;
  priority?: Priority;
  dueDate?: string | null;
  reminderAt?: string | null;
  tags?: string[];
  project?: string;
  recurrence?: Recurrence;
}

export interface AppSettings {
  key: 'app';
  theme: ThemeMode;
  onboardingComplete: boolean;
  reduceMotion: boolean;
  notificationsEnabled: boolean;
}

export interface TaskFilters {
  search: string;
  view: SmartView;
  project: string;
  tag: string;
  priority: Priority | 'all';
  sort: SortMode;
}

export interface ProductivityStats {
  active: number;
  completed: number;
  archived: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  completedLast7Days: number;
}

export interface TaskBackup {
  schemaVersion: 2;
  exportedAt: string;
  app: 'TaskMint';
  tasks: Task[];
  settings?: AppSettings;
}
