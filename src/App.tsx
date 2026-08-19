import { useEffect, useMemo, useRef, useState } from 'react';
import { Onboarding } from './components/Onboarding';
import { SettingsDialog } from './components/SettingsDialog';
import { Sidebar } from './components/Sidebar';
import { StatsPanel } from './components/StatsPanel';
import { TaskComposer } from './components/TaskComposer';
import { TaskItem } from './components/TaskItem';
import { Toolbar } from './components/Toolbar';
import { TASK_PAGE_SIZE } from './config';
import { fail } from './domain/errors';
import { TASK_LIMITS } from './domain/limits';
import { nextTaskOrder } from './domain/order';
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
import { strings } from './i18n/en';
import { userErrorMessage } from './i18n/errors';
import { defaultSettings, repository } from './storage/repository';
import { csvToTasks, downloadText, parseBackup, serializeBackup, tasksToCsv } from './utils/export';
import { isEditableTarget, resolveGlobalShortcut } from './utils/keyboard';
import { logError, logEvent } from './utils/logger';
import { notifyDueTasks, requestNotificationPermission } from './utils/notifications';

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
  const [visibleLimit, setVisibleLimit] = useState(TASK_PAGE_SIZE);
  const [now, setNow] = useState(() => new Date());
  const draggedTask = useRef<Task | null>(null);
  const notifiedIds = useRef(new Set<string>());
  const searchInput = useRef<HTMLInputElement>(null);
  const taskTitleInput = useRef<HTMLInputElement>(null);

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
        setToast({ message: strings.loadFailed });
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
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = resolveGlobalShortcut({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        editableTarget: isEditableTarget(event.target),
        blocked: settingsOpen || !settings.onboardingComplete
      });
      if (!shortcut) return;
      if (shortcut === 'new-task' && editingTask) return;
      event.preventDefault();
      if (shortcut === 'search') {
        searchInput.current?.focus();
        searchInput.current?.select();
      } else {
        taskTitleInput.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingTask, settings.onboardingComplete, settingsOpen]);

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

  useEffect(() => {
    setVisibleLimit(TASK_PAGE_SIZE);
  }, [filters]);

  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, filters, now),
    [filters, now, tasks]
  );
  const renderedTasks = useMemo(
    () => visibleTasks.slice(0, visibleLimit),
    [visibleLimit, visibleTasks]
  );
  const remainingTasks = Math.max(0, visibleTasks.length - renderedTasks.length);
  const stats = useMemo(() => calculateStats(tasks, now), [now, tasks]);
  const projects = useMemo(
    () => [...new Set(tasks.map((task) => task.project).filter(Boolean))].sort(),
    [tasks]
  );
  const tags = useMemo(() => [...new Set(tasks.flatMap((task) => task.tags))].sort(), [tasks]);
  const today = formatLocalDate(now);

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
      const reminderChanged = editingTask.reminderAt !== next.reminderAt;
      try {
        await repository.putTask(next);
      } catch (error) {
        logError('task_update_failed', error);
        throw new Error(strings.taskSavedError);
      }
      if (reminderChanged) notifiedIds.current.delete(next.id);
      setTasks((current) => current.map((task) => (task.id === next.id ? next : task)));
      setEditingTask(null);
      setToast({ message: strings.taskUpdated });
      logEvent('task_updated', { taskId: next.id });
      return;
    }

    const task = createTask(draft, new Date(), nextTaskOrder(tasks));
    try {
      await repository.putTask(task);
    } catch (error) {
      logError('task_create_failed', error);
      throw new Error(strings.taskSavedError);
    }
    setTasks((current) => [...current, task]);
    setToast({ message: strings.taskAdded });
    logEvent('task_created', { taskId: task.id });
  }

  async function toggleTask(task: Task) {
    if (task.status === 'completed') {
      const next = reopenTask(task);
      const saved = await runUserAction('task_reopen_failed', strings.taskReopenError, () =>
        repository.putTask(next)
      );
      if (!saved) return;
      replaceLocal(next);
      logEvent('task_reopened', { taskId: next.id });
      return;
    }
    if (task.status !== 'active') return;

    const result = completeTask(task);
    const saved = await runUserAction('task_complete_failed', strings.taskCompleteError, () =>
      result.next
        ? repository.putTasks([result.completed, result.next])
        : repository.putTask(result.completed)
    );
    if (!saved) return;
    setTasks((current) => [
      ...current.map((item) => (item.id === result.completed.id ? result.completed : item)),
      ...(result.next ? [result.next] : [])
    ]);
    setToast({ message: result.next ? strings.recurringTaskCompleted : strings.taskCompleted });
    logEvent('task_completed', { taskId: result.completed.id, recurring: Boolean(result.next) });
  }

  async function archive(task: Task) {
    const next = archiveTask(task);
    const saved = await runUserAction('task_archive_failed', strings.taskArchiveError, () =>
      repository.putTask(next)
    );
    if (!saved) return;
    replaceLocal(next);
    logEvent('task_archived', { taskId: next.id });
  }

  async function restore(task: Task) {
    const next = restoreTask(task);
    const saved = await runUserAction('task_restore_failed', strings.taskRestoreError, () =>
      repository.putTask(next)
    );
    if (!saved) return;
    replaceLocal(next);
    logEvent('task_restored', { taskId: next.id });
  }

  async function remove(task: Task) {
    const deleted = await runUserAction('task_delete_failed', strings.taskDeleteError, () =>
      repository.deleteTask(task.id)
    );
    if (!deleted) return;
    setTasks((current) => current.filter((item) => item.id !== task.id));
    setEditingTask((current) => (current?.id === task.id ? null : current));
    setToast({
      message: strings.taskDeleted,
      actionLabel: strings.undo,
      action: async () => {
        const restored = await runUserAction(
          'task_delete_undo_failed',
          strings.taskDeleteUndoError,
          () => repository.putTask(task)
        );
        if (!restored) return;
        setTasks((current) => [...current, task]);
        setToast({ message: strings.taskRestored });
      }
    });
    logEvent('task_deleted', { taskId: task.id });
  }

  async function move(task: Task, direction: -1 | 1) {
    const active = renderedTasks
      .filter((item) => item.status === 'active')
      .sort((a, b) => a.order - b.order);
    const index = active.findIndex((item) => item.id === task.id);
    const target = active[index + direction];
    if (!target) return;
    const moved = { ...task, order: target.order, updatedAt: new Date().toISOString() };
    const swapped = { ...target, order: task.order, updatedAt: new Date().toISOString() };
    const saved = await runUserAction('task_keyboard_reorder_failed', strings.taskReorderError, () =>
      repository.putTasks([moved, swapped])
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
    const activeRenderedTasks = renderedTasks.filter((task) => task.status === 'active');
    const changed = reorderVisibleTasks(activeRenderedTasks, source.id, target.id);
    if (!changed.length) return;
    const saved = await runUserAction('task_drag_reorder_failed', strings.taskReorderError, () =>
      repository.putTasks(changed)
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
      throw new Error(strings.settingsStorageError);
    }
    setSettings(next);
  }

  async function finishOnboarding() {
    await changeSettings({ ...settings, onboardingComplete: true });
  }

  async function enableNotifications() {
    const enabled = await requestNotificationPermission();
    await changeSettings({ ...settings, notificationsEnabled: enabled });
    setToast({ message: enabled ? strings.remindersEnabled : strings.remindersNotEnabled });
  }

  async function importJson(file: File) {
    try {
      const backup = parseBackup(await readFile(file));
      if (tasks.length > 0 && !window.confirm(strings.restoreConfirm(backup.tasks.length, tasks.length))) {
        return;
      }
      await repository.restoreBackup(backup);
      notifiedIds.current.clear();
      setTasks(backup.tasks);
      if (backup.settings) setSettings(backup.settings);
      setToast({ message: strings.restoredTasks(backup.tasks.length) });
    } catch (error) {
      logError('json_import_failed', error);
      setToast({ message: userErrorMessage(error, strings.importBackupError) });
    }
  }

  async function importCsv(file: File) {
    try {
      const imported = csvToTasks(await readFile(file));
      await repository.putTasks(imported);
      setTasks((current) => [...current, ...imported]);
      setToast({ message: strings.importedTasks(imported.length) });
    } catch (error) {
      logError('csv_import_failed', error);
      setToast({ message: userErrorMessage(error, strings.importCsvError) });
    }
  }

  async function deleteAllData() {
    if (!window.confirm(strings.deleteAllConfirm)) return;
    const deleted = await runUserAction('delete_all_data_failed', strings.deleteAllError, () =>
      repository.deleteAllLocalData()
    );
    if (!deleted) return;
    notifiedIds.current.clear();
    setTasks([]);
    setSettings({ ...defaultSettings, onboardingComplete: true });
    setEditingTask(null);
    setToast({ message: strings.deleteAllSuccess });
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
        <p>{strings.loadingLocalTasks}</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      {!settings.onboardingComplete && <Onboarding onComplete={finishOnboarding} />}
      <header className="topbar">
        <a className="brand" href="/" aria-label={`${strings.appName} home`}>
          <img src="/taskmint-icon.svg" width="36" height="36" alt="" />
          <span>
            <strong>{strings.appName}</strong>
            <small>{strings.tagline}</small>
          </span>
        </a>
        <div className="top-actions">
          {offline && <span className="offline-badge">{strings.offline}</span>}
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
            titleInputRef={taskTitleInput}
            onSubmit={saveDraft}
            onCancelEdit={() => setEditingTask(null)}
          />
          <Toolbar
            search={filters.search}
            priority={filters.priority}
            tag={filters.tag}
            sort={filters.sort}
            tags={tags}
            searchInputRef={searchInput}
            onSearch={(search) => setFilters((current) => ({ ...current, search }))}
            onPriority={(priority) => setFilters((current) => ({ ...current, priority }))}
            onTag={(tag) => setFilters((current) => ({ ...current, tag }))}
            onSort={(sort) => setFilters((current) => ({ ...current, sort }))}
          />
          {statsOpen && <StatsPanel stats={stats} />}

          <section className="task-section" aria-labelledby="task-list-title">
            <div className="section-heading">
              <h1 id="task-list-title">{viewTitle(filters)}</h1>
              <span>{strings.taskCount(visibleTasks.length)}</span>
            </div>
            {visibleTasks.length === 0 ? (
              <div className="empty-state card">
                <h2>{strings.emptyTitle}</h2>
                <p>{strings.emptyBody}</p>
              </div>
            ) : (
              <>
                <ul id="task-list" className="task-list">
                  {renderedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isOverdue={
                        task.status === 'active' && Boolean(task.dueDate) && task.dueDate! < today
                      }
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
                {remainingTasks > 0 && (
                  <div className="load-more">
                    <button
                      className="secondary"
                      type="button"
                      aria-controls="task-list"
                      onClick={() => setVisibleLimit((current) => current + TASK_PAGE_SIZE)}
                    >
                      {strings.showMoreTasks(remainingTasks)}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      <footer className="footer">
        <span>{strings.madeBy}</span>
        <a href="https://github.com/sanskarIN/taskmint" target="_blank" rel="noreferrer">
          {strings.sourceCode}
        </a>
        <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">
          {strings.buyMeACoffee}
        </a>
      </footer>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span>{toast.message}</span>
          {toast.action && (
            <button type="button" onClick={() => void toast.action?.()}>
              {toast.actionLabel ?? strings.undo}
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

function viewTitle(filters: TaskFilters): string {
  if (filters.project) return filters.project;
  const labels: Record<SmartView, string> = {
    inbox: strings.viewInbox,
    today: strings.viewToday,
    upcoming: strings.viewUpcoming,
    overdue: strings.viewOverdue,
    completed: strings.viewCompleted,
    archived: strings.viewArchived,
    all: strings.viewAll
  };
  return labels[filters.view];
}

async function readFile(file: File): Promise<string> {
  if (file.size > TASK_LIMITS.importBytes) fail('import-file-too-large');
  return file.text();
}
