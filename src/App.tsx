import { useEffect, useMemo, useRef, useState } from 'react';
import { TaskComposer } from './components/TaskComposer';
import { TaskItem } from './components/TaskItem';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { StatsPanel } from './components/StatsPanel';
import { SettingsDialog } from './components/SettingsDialog';
import { Onboarding } from './components/Onboarding';
import {
  archiveTask,
  calculateStats,
  completeTask,
  createTask,
  filterAndSortTasks,
  formatLocalDate,
  reorderVisibleTasks,
  reopenTask,
  restoreTask,
  updateTask
} from './domain/task';
import type { AppSettings, SmartView, Task, TaskDraft, TaskFilters } from './domain/types';
import { repository, defaultSettings } from './storage/repository';
import { csvToTasks, downloadText, parseBackup, serializeBackup, tasksToCsv } from './utils/export';
import { logError, logEvent } from './utils/logger';
import { notifyDueTasks, requestNotificationPermission } from './utils/notifications';
import { strings } from './i18n/en';

const defaultFilters: TaskFilters = {
  search: '',
  view: 'inbox',
  project: '',
  tag: '',
  priority: 'all',
  sort: 'manual'
};

interface ToastState {
  message: string;
  actionLabel?: string;
  action?: () => Promise<void>;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [toast, setToast] = useState<ToastState | null>(null);
  const draggedTask = useRef<Task | null>(null);
  const notifiedIds = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    void Promise.all([repository.listTasks(), repository.getSettings()])
      .then(([loadedTasks, loadedSettings]) => {
        if (cancelled) return;
        setTasks(loadedTasks);
        setSettings(loadedSettings);
      })
      .catch((error: unknown) => {
        logError('load_failed', error);
        setToast({ message: 'Could not load local data. Try reloading TaskMint.' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved =
        settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme;
      root.dataset.theme = resolved;
      root.dataset.reduceMotion = settings.reduceMotion ? 'true' : 'false';
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [settings.theme, settings.reduceMotion]);

  useEffect(() => {
    const online = () => setOffline(false);
    const offlineHandler = () => setOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offlineHandler);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offlineHandler);
    };
  }, []);

  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    const check = () => {
      notifiedIds.current = notifyDueTasks(tasks, notifiedIds.current);
    };
    check();
    const timer = window.setInterval(check, 30_000);
    return () => window.clearInterval(timer);
  }, [tasks, settings.notificationsEnabled]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const visibleTasks = useMemo(() => filterAndSortTasks(tasks, filters), [tasks, filters]);
  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  const projects = useMemo(
    () => [...new Set(tasks.map((task) => task.project).filter(Boolean))].sort(),
    [tasks]
  );
  const tags = useMemo(() => [...new Set(tasks.flatMap((task) => task.tags))].sort(), [tasks]);
  const today = formatLocalDate(new Date());

  async function runUserAction(
    event: string,
    failureMessage: string,
    action: () => Promise<void>
  ): Promise<boolean> {
    try {
      await action();
      return true;
    } catch (error) {
      logError(event, error);
      setToast({ message: failureMessage });
      return false;
    }
  }

  async function saveDraft(draft: TaskDraft) {
    if (editingTask) {
      const next = updateTask(editingTask, draft);
      if (editingTask.reminderAt !== next.reminderAt) notifiedIds.current.delete(next.id);
      try {
        await repository.putTask(next);
      } catch (error) {
        logError('task_update_failed', error);
        throw new Error('Could not save the task to local storage.');
      }
      setTasks((current) => current.map((task) => (task.id === next.id ? next : task)));
      setEditingTask(null);
      setToast({ message: 'Task updated.' });
      logEvent('task_updated', { taskId: next.id });
      return;
    }
    const task = createTask(draft, new Date(), nextOrder(tasks));
    try {
      await repository.putTask(task);
    } catch (error) {
      logError('task_create_failed', error);
      throw new Error('Could not save the task to local storage.');
    }
    setTasks((current) => [...current, task]);
    setToast({ message: 'Task added.' });
    logEvent('task_created', { taskId: task.id });
  }

  async function toggleTask(task: Task) {
    if (task.status === 'completed') {
      const next = reopenTask(task);
      const saved = await runUserAction(
        'task_reopen_failed',
        'Could not reopen the task. Your local data was left unchanged.',
        () => repository.putTask(next)
      );
      if (!saved) return;
      replaceLocal(next);
      logEvent('task_reopened', { taskId: next.id });
      return;
    }
    if (task.status !== 'active') return;
    const result = completeTask(task);
    const saved = await runUserAction(
      'task_complete_failed',
      'Could not complete the task. Your local data was left unchanged.',
      () =>
        result.next
          ? repository.putTasks([result.completed, result.next])
          : repository.putTask(result.completed)
    );
    if (!saved) return;
    setTasks((current) => [
      ...current.map((item) => (item.id === result.completed.id ? result.completed : item)),
      ...(result.next ? [result.next] : [])
    ]);
    setToast({
      message: result.next
        ? 'Task completed. Next occurrence created.'
        : 'Task completed.'
    });
    logEvent('task_completed', { taskId: result.completed.id, recurring: Boolean(result.next) });
  }

  async function archive(task: Task) {
    const next = archiveTask(task);
    const saved = await runUserAction(
      'task_archive_failed',
      'Could not archive the task. Your local data was left unchanged.',
      () => repository.putTask(next)
    );
    if (!saved) return;
    replaceLocal(next);
    logEvent('task_archived', { taskId: next.id });
  }

  async function restore(task: Task) {
    const next = restoreTask(task);
    const saved = await runUserAction(
      'task_restore_failed',
      'Could not restore the task. Your local data was left unchanged.',
      () => repository.putTask(next)
    );
    if (!saved) return;
    replaceLocal(next);
    logEvent('task_restored', { taskId: next.id });
  }

  async function remove(task: Task) {
    const deleted = await runUserAction(
      'task_delete_failed',
      'Could not delete the task. Your local data was left unchanged.',
      () => repository.deleteTask(task.id)
    );
    if (!deleted) return;
    setTasks((current) => current.filter((item) => item.id !== task.id));
    setEditingTask((current) => (current?.id === task.id ? null : current));
    setToast({
      message: 'Task deleted.',
      actionLabel: 'Undo',
      action: async () => {
        const restored = await runUserAction(
          'task_delete_undo_failed',
          'Could not undo deletion. Restore the task from a backup if needed.',
          () => repository.putTask(task)
        );
        if (!restored) return;
        setTasks((current) => [...current, task]);
        setToast({ message: 'Task restored.' });
      }
    });
    logEvent('task_deleted', { taskId: task.id });
  }

  async function move(task: Task, direction: -1 | 1) {
    const active = visibleTasks
      .filter((item) => item.status === 'active')
      .sort((a, b) => a.order - b.order);
    const index = active.findIndex((item) => item.id === task.id);
    const target = active[index + direction];
    if (!target) return;
    const moved = { ...task, order: target.order, updatedAt: new Date().toISOString() };
    const swapped = { ...target, order: task.order, updatedAt: new Date().toISOString() };
    const saved = await runUserAction(
      'task_keyboard_reorder_failed',
      'Could not reorder tasks. Your local data was left unchanged.',
      () => repository.putTasks([moved, swapped])
    );
    if (!saved) return;
    setTasks((current) =>
      current.map((item) => (item.id === moved.id ? moved : item.id === swapped.id ? swapped : item))
    );
  }

  async function dropOn(target: Task) {
    const source = draggedTask.current;
    draggedTask.current = null;
    if (
      !source ||
      source.id === target.id ||
      source.status !== 'active' ||
      target.status !== 'active' ||
      filters.sort !== 'manual'
    ) {
      return;
    }
    const activeVisibleTasks = visibleTasks.filter((task) => task.status === 'active');
    const changed = reorderVisibleTasks(activeVisibleTasks, source.id, target.id);
    if (!changed.length) return;
    const saved = await runUserAction(
      'task_drag_reorder_failed',
      'Could not reorder tasks. Your local data was left unchanged.',
      () => repository.putTasks(changed)
    );
    if (!saved) return;
    const changedById = new Map(changed.map((task) => [task.id, task]));
    setTasks((current) => current.map((task) => changedById.get(task.id) ?? task));
  }

  async function changeSettings(next: AppSettings) {
    try {
      await repository.saveSettings(next);
    } catch (error) {
      logError('settings_save_failed', error);
      throw new Error('Could not save settings to local storage.');
    }
    setSettings(next);
  }

  async function finishOnboarding() {
    await changeSettings({ ...settings, onboardingComplete: true });
  }

  async function enableNotifications() {
    const enabled = await requestNotificationPermission();
    await changeSettings({ ...settings, notificationsEnabled: enabled });
    setToast({
      message: enabled ? 'Browser reminders enabled.' : 'Notifications were not enabled.'
    });
  }

  async function importJson(file: File) {
    try {
      const backup = parseBackup(await readFile(file));
      if (
        tasks.length > 0 &&
        !window.confirm(
          `Restore ${backup.tasks.length} tasks and replace the ${tasks.length} tasks currently stored in TaskMint?`
        )
      ) {
        return;
      }
      await repository.restoreBackup(backup);
      notifiedIds.current.clear();
      setTasks(backup.tasks);
      if (backup.settings) setSettings(backup.settings);
      setToast({ message: `Restored ${backup.tasks.length} tasks.` });
    } catch (error) {
      logError('json_import_failed', error);
      setToast({ message: error instanceof Error ? error.message : 'Could not import backup.' });
    }
  }

  async function importCsv(file: File) {
    try {
      const imported = csvToTasks(await readFile(file));
      await repository.putTasks(imported);
      setTasks((current) => [...current, ...imported]);
      setToast({ message: `Imported ${imported.length} tasks.` });
    } catch (error) {
      logError('csv_import_failed', error);
      setToast({ message: error instanceof Error ? error.message : 'Could not import CSV.' });
    }
  }

  async function deleteAllData() {
    if (
      !window.confirm(
        'Delete every TaskMint task and local setting from this browser? This cannot be undone unless you have a backup.'
      )
    ) {
      return;
    }
    const deleted = await runUserAction(
      'delete_all_data_failed',
      'Could not delete all local data. Your existing data was left in place.',
      () => repository.deleteAllLocalData()
    );
    if (!deleted) return;
    notifiedIds.current.clear();
    setTasks([]);
    setSettings({ ...defaultSettings, onboardingComplete: true });
    setEditingTask(null);
    setToast({ message: 'All local TaskMint data was deleted.' });
  }

  function replaceLocal(next: Task) {
    setTasks((current) => current.map((task) => (task.id === next.id ? next : task)));
  }

  function chooseView(view: SmartView) {
    setFilters((current) => ({ ...current, view, project: '' }));
  }

  if (loading) {
    return (
      <main className="loading-state" aria-busy="true">
        <img src="/taskmint-icon.svg" width="56" height="56" alt="" />
        <p>Loading your local tasks…</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      {!settings.onboardingComplete && <Onboarding onComplete={finishOnboarding} />}
      <header className="topbar">
        <a className="brand" href="/" aria-label="TaskMint home">
          <img src="/taskmint-icon.svg" width="36" height="36" alt="" />
          <span>
            <strong>{strings.appName}</strong>
            <small>{strings.tagline}</small>
          </span>
        </a>
        <div className="top-actions">
          {offline && <span className="offline-badge">Offline</span>}
          <button
            className="secondary"
            type="button"
            onClick={() => setStatsOpen((value) => !value)}
          >
            {strings.statistics}
          </button>
          <button className="secondary" type="button" onClick={() => setSettingsOpen(true)}>
            {strings.settings}
          </button>
        </div>
      </header>

      <div className="workspace">
        <Sidebar
          activeView={filters.view}
          projects={projects}
          activeProject={filters.project}
          onView={chooseView}
          onProject={(project) =>
            setFilters((current) => ({ ...current, project, view: 'all' }))
          }
        />

        <main className="main-content">
          <TaskComposer
            editingTask={editingTask}
            onSubmit={saveDraft}
            onCancelEdit={() => setEditingTask(null)}
          />
          <Toolbar
            search={filters.search}
            priority={filters.priority}
            tag={filters.tag}
            sort={filters.sort}
            tags={tags}
            onSearch={(search) => setFilters((current) => ({ ...current, search }))}
            onPriority={(priority) => setFilters((current) => ({ ...current, priority }))}
            onTag={(tag) => setFilters((current) => ({ ...current, tag }))}
            onSort={(sort) => setFilters((current) => ({ ...current, sort }))}
          />
          {statsOpen && <StatsPanel stats={stats} />}

          <section className="task-section" aria-labelledby="task-list-title">
            <div className="section-heading">
              <h1 id="task-list-title">{viewTitle(filters)}</h1>
              <span>
                {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            {visibleTasks.length === 0 ? (
              <div className="empty-state card">
                <h2>{strings.emptyTitle}</h2>
                <p>{strings.emptyBody}</p>
              </div>
            ) : (
              <ul className="task-list">
                {visibleTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isOverdue={task.status === 'active' && Boolean(task.dueDate) && task.dueDate! < today}
                    canReorder={filters.sort === 'manual' && task.status === 'active'}
                    onToggle={toggleTask}
                    onEdit={(next) => {
                      setEditingTask(next);
                      window.scrollTo({
                        top: 0,
                        behavior: settings.reduceMotion ? 'auto' : 'smooth'
                      });
                    }}
                    onArchive={archive}
                    onRestore={restore}
                    onDelete={remove}
                    onMove={move}
                    onDragStart={(next) => {
                      draggedTask.current = next;
                    }}
                    onDrop={dropOn}
                  />
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

      <footer className="footer">
        <span>{strings.madeBy}</span>
        <a href="https://github.com/sanskarIN/taskmint" target="_blank" rel="noreferrer">
          Source code
        </a>
        <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">
          Buy Me a Coffee
        </a>
      </footer>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span>{toast.message}</span>
          {toast.action && (
            <button type="button" onClick={() => void toast.action?.()}>
              {toast.actionLabel ?? 'Undo'}
            </button>
          )}
        </div>
      )}

      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onChange={changeSettings}
        onExportJson={() =>
          downloadText(
            `taskmint-backup-${today}.json`,
            serializeBackup(tasks, settings),
            'application/json'
          )
        }
        onExportCsv={() =>
          downloadText(
            `taskmint-tasks-${today}.csv`,
            tasksToCsv(tasks),
            'text/csv;charset=utf-8'
          )
        }
        onImportJson={importJson}
        onImportCsv={importCsv}
        onDeleteAll={deleteAllData}
        onEnableNotifications={enableNotifications}
      />
    </div>
  );
}

function nextOrder(tasks: Task[]): number {
  return Math.max(0, ...tasks.map((task) => task.order)) + 1000;
}

function viewTitle(filters: TaskFilters): string {
  if (filters.project) return filters.project;
  const labels: Record<SmartView, string> = {
    inbox: 'Inbox',
    today: 'Today',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    completed: 'Completed',
    archived: 'Archived',
    all: 'All tasks'
  };
  return labels[filters.view];
}

async function readFile(file: File): Promise<string> {
  if (file.size > 25_000_000) throw new Error('Import file is too large.');
  return file.text();
}
