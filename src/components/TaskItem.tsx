import type { Priority, Recurrence, Task } from '../domain/types';
import { strings } from '../i18n/en';

const priorityLabels: Record<Priority, string> = {
  low: strings.priorityLow,
  medium: strings.priorityMedium,
  high: strings.priorityHigh,
  urgent: strings.priorityUrgent
};

const recurrenceLabels: Record<Exclude<Recurrence, 'none'>, string> = {
  daily: strings.recurrenceDaily,
  weekly: strings.recurrenceWeekly,
  monthly: strings.recurrenceMonthly
};

interface Props {
  task: Task;
  isOverdue: boolean;
  canReorder: boolean;
  onToggle: (task: Task) => Promise<void>;
  onEdit: (task: Task) => void;
  onArchive: (task: Task) => Promise<void>;
  onRestore: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  onMove: (task: Task, direction: -1 | 1) => Promise<void>;
  onDragStart: (task: Task) => void;
  onDrop: (task: Task) => Promise<void>;
}

export function TaskItem({
  task,
  isOverdue,
  canReorder,
  onToggle,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onMove,
  onDragStart,
  onDrop
}: Props) {
  return (
    <li
      className={`task-card card priority-${task.priority}`}
      draggable={canReorder}
      onDragStart={() => onDragStart(task)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(task)}
    >
      <div className="task-row">
        <button
          className={`check-button ${task.status === 'completed' ? 'checked' : ''}`}
          type="button"
          aria-label={
            task.status === 'completed'
              ? strings.reopenTaskLabel(task.title)
              : strings.completeTaskLabel(task.title)
          }
          onClick={() => onToggle(task)}
          disabled={task.status === 'archived'}
        >
          {task.status === 'completed' ? '✓' : ''}
        </button>
        <div className="task-content">
          <div className="task-title-row">
            <strong className={task.status === 'completed' ? 'completed-text' : ''}>
              {task.title}
            </strong>
            <span className="priority-badge">{priorityLabels[task.priority]}</span>
          </div>
          {task.notes && <p className="task-notes">{task.notes}</p>}
          <div className="task-meta" aria-label={strings.taskDetails}>
            {task.dueDate && (
              <span className={isOverdue ? 'danger-text' : ''}>
                {strings.dueLabel(formatDate(task.dueDate))}
              </span>
            )}
            {task.reminderAt && <span>{strings.reminderLabel(formatDateTime(task.reminderAt))}</span>}
            {task.project && <span>{strings.projectLabel(task.project)}</span>}
            {task.recurrence !== 'none' && (
              <span>{strings.repeatsLabel(recurrenceLabels[task.recurrence])}</span>
            )}
          </div>
          {task.tags.length > 0 && (
            <div className="tag-list">
              {task.tags.map((tag) => (
                <span className="tag" key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="task-actions" aria-label={strings.taskActionsLabel(task.title)}>
          {canReorder && (
            <>
              <button
                className="icon-button"
                type="button"
                onClick={() => onMove(task, -1)}
                aria-label={strings.moveTaskUp}
              >
                ↑
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => onMove(task, 1)}
                aria-label={strings.moveTaskDown}
              >
                ↓
              </button>
            </>
          )}
          {task.status !== 'archived' && (
            <button className="ghost" type="button" onClick={() => onEdit(task)}>
              {strings.edit}
            </button>
          )}
          {task.status === 'archived' ? (
            <button className="ghost" type="button" onClick={() => onRestore(task)}>
              {strings.restore}
            </button>
          ) : (
            <button className="ghost" type="button" onClick={() => onArchive(task)}>
              {strings.archive}
            </button>
          )}
          <button className="danger ghost" type="button" onClick={() => onDelete(task)}>
            {strings.delete}
          </button>
        </div>
      </div>
    </li>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(`${value}T12:00:00`)
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );
}
