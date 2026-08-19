import { useEffect, useId, useState, type FormEvent } from 'react';
import type { Recurrence, Task, TaskDraft } from '../domain/types';
import { strings } from '../i18n/en';

interface Props {
  editingTask?: Task | null;
  onSubmit: (draft: TaskDraft) => Promise<void>;
  onCancelEdit?: () => void;
}

export function TaskComposer({ editingTask = null, onSubmit, onCancelEdit }: Props) {
  const formId = useId();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskDraft['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [tags, setTags] = useState('');
  const [project, setProject] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editingTask) {
      reset();
      return;
    }
    setTitle(editingTask.title);
    setNotes(editingTask.notes);
    setPriority(editingTask.priority);
    setDueDate(editingTask.dueDate ?? '');
    setReminderAt(toLocalInput(editingTask.reminderAt));
    setTags(editingTask.tags.join(', '));
    setProject(editingTask.project);
    setRecurrence(editingTask.recurrence);
    setExpanded(true);
    setError('');
  }, [editingTask]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await onSubmit({
        title,
        notes,
        priority,
        dueDate: dueDate || null,
        reminderAt: reminderAt || null,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        project,
        recurrence
      });
      reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the task.');
    }
  }

  function reset() {
    setTitle('');
    setNotes('');
    setPriority('medium');
    setDueDate('');
    setReminderAt('');
    setTags('');
    setProject('');
    setRecurrence('none');
    setExpanded(false);
    setError('');
  }

  function cancelEdit() {
    reset();
    onCancelEdit?.();
  }

  return (
    <form
      className="composer card"
      onSubmit={handleSubmit}
      aria-label={editingTask ? strings.editTask : strings.addTask}
    >
      <div className="composer-main">
        <label className="sr-only" htmlFor={`${formId}-title`}>
          Task title
        </label>
        <input
          id={`${formId}-title`}
          className="title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="What needs to be done?"
          maxLength={240}
          required
          autoComplete="off"
        />
        <button className="primary" type="submit">
          {editingTask ? strings.saveChanges : strings.addTask}
        </button>
      </div>

      {expanded && (
        <div className="composer-details">
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={20000}
              rows={3}
            />
          </label>
          <label>
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskDraft['priority'])}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label>
            Due date
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <label>
            Reminder
            <input
              type="datetime-local"
              value={reminderAt}
              onChange={(event) => setReminderAt(event.target.value)}
            />
          </label>
          <label>
            Project
            <input
              value={project}
              onChange={(event) => setProject(event.target.value)}
              maxLength={80}
              placeholder="e.g. School"
            />
          </label>
          <label>
            Tags
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="study, important"
            />
          </label>
          <label>
            Repeat
            <select
              value={recurrence}
              onChange={(event) => setRecurrence(event.target.value as Recurrence)}
            >
              <option value="none">Never</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          {editingTask && (
            <button type="button" className="ghost" onClick={cancelEdit}>
              {strings.cancel}
            </button>
          )}
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function toLocalInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
