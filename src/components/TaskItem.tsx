import type { Task } from '../domain/types';

interface Props {
  task: Task;
  isOverdue: boolean;
  onToggle: (task: Task) => Promise<void>;
  onEdit: (task: Task) => void;
  onArchive: (task: Task) => Promise<void>;
  onRestore: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  onMove: (task: Task, direction: -1 | 1) => Promise<void>;
  onDragStart: (task: Task) => void;
  onDrop: (task: Task) => Promise<void>;
}

export function TaskItem({ task, isOverdue, onToggle, onEdit, onArchive, onRestore, onDelete, onMove, onDragStart, onDrop }: Props) {
  return (
    <li
      className={`task-card card priority-${task.priority}`}
      draggable={task.status === 'active'}
      onDragStart={() => onDragStart(task)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(task)}
    >
      <div className="task-row">
        <button
          className={`check-button ${task.status === 'completed' ? 'checked' : ''}`}
          type="button"
          aria-label={task.status === 'completed' ? `Reopen ${task.title}` : `Complete ${task.title}`}
          onClick={() => onToggle(task)}
          disabled={task.status === 'archived'}
        >
          {task.status === 'completed' ? '✓' : ''}
        </button>
        <div className="task-content">
          <div className="task-title-row">
            <strong className={task.status === 'completed' ? 'completed-text' : ''}>{task.title}</strong>
            <span className="priority-badge">{task.priority}</span>
          </div>
          {task.notes && <p className="task-notes">{task.notes}</p>}
          <div className="task-meta" aria-label="Task details">
            {task.dueDate && <span className={isOverdue ? 'danger-text' : ''}>Due {formatDate(task.dueDate)}</span>}
            {task.reminderAt && <span>Reminder {formatDateTime(task.reminderAt)}</span>}
            {task.project && <span>Project: {task.project}</span>}
            {task.recurrence !== 'none' && <span>Repeats {task.recurrence}</span>}
          </div>
          {task.tags.length > 0 && <div className="tag-list">{task.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>}
        </div>
        <div className="task-actions" aria-label={`Actions for ${task.title}`}>
          {task.status === 'active' && <>
            <button className="icon-button" type="button" onClick={() => onMove(task, -1)} aria-label="Move task up">↑</button>
            <button className="icon-button" type="button" onClick={() => onMove(task, 1)} aria-label="Move task down">↓</button>
          </>}
          {task.status !== 'archived' && <button className="ghost" type="button" onClick={() => onEdit(task)}>Edit</button>}
          {task.status === 'archived' ? (
            <button className="ghost" type="button" onClick={() => onRestore(task)}>Restore</button>
          ) : (
            <button className="ghost" type="button" onClick={() => onArchive(task)}>Archive</button>
          )}
          <button className="danger ghost" type="button" onClick={() => onDelete(task)}>Delete</button>
        </div>
      </div>
    </li>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
