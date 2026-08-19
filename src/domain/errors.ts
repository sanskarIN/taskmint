export type TaskMintErrorCode =
  | 'task-order-invalid'
  | 'task-title-required'
  | 'task-title-too-long'
  | 'task-notes-too-long'
  | 'task-project-too-long'
  | 'task-due-date-invalid'
  | 'task-reminder-invalid'
  | 'task-tag-too-long'
  | 'task-tags-too-many'
  | 'backup-json-invalid'
  | 'backup-object-invalid'
  | 'backup-schema-invalid'
  | 'backup-too-many-tasks'
  | 'backup-duplicate-task-id'
  | 'backup-task-invalid'
  | 'backup-task-id-invalid'
  | 'backup-task-title-invalid'
  | 'backup-task-notes-too-long'
  | 'backup-task-project-too-long'
  | 'backup-task-enum-invalid'
  | 'backup-active-timestamps-invalid'
  | 'backup-completed-timestamps-invalid'
  | 'backup-archived-timestamp-missing'
  | 'backup-task-tags-invalid'
  | 'backup-task-tag-invalid'
  | 'backup-task-tags-too-many'
  | 'backup-task-order-invalid'
  | 'backup-settings-invalid'
  | 'backup-settings-theme-invalid'
  | 'backup-field-invalid'
  | 'backup-file-too-large'
  | 'csv-file-too-large'
  | 'csv-too-many-tasks'
  | 'csv-missing-columns'
  | 'csv-duplicate-columns'
  | 'csv-invalid-priority'
  | 'csv-invalid-recurrence'
  | 'csv-invalid-status'
  | 'csv-invalid-tags'
  | 'csv-row-invalid'
  | 'csv-unterminated-quote'
  | 'import-file-too-large';

export interface TaskMintErrorDetails {
  max?: number;
  field?: string;
  id?: string;
  row?: number;
  columns?: string[];
  causeMessage?: string;
}

export class TaskMintError extends Error {
  readonly code: TaskMintErrorCode;
  readonly details: Readonly<TaskMintErrorDetails>;

  constructor(code: TaskMintErrorCode, details: TaskMintErrorDetails = {}) {
    super(errorMessage(code, details));
    this.name = 'TaskMintError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

export function fail(code: TaskMintErrorCode, details: TaskMintErrorDetails = {}): never {
  throw new TaskMintError(code, details);
}

export function errorMessage(code: TaskMintErrorCode, details: TaskMintErrorDetails = {}): string {
  switch (code) {
    case 'task-order-invalid':
      return 'Task order must be a finite number.';
    case 'task-title-required':
      return 'Task title is required.';
    case 'task-title-too-long':
      return `Task title must be ${details.max ?? 240} characters or fewer.`;
    case 'task-notes-too-long':
      return `Task notes must be ${details.max ?? 20_000} characters or fewer.`;
    case 'task-project-too-long':
      return `Project must be ${details.max ?? 80} characters or fewer.`;
    case 'task-due-date-invalid':
      return 'Due date is invalid.';
    case 'task-reminder-invalid':
      return 'Reminder date/time is invalid.';
    case 'task-tag-too-long':
      return `Each tag must be ${details.max ?? 32} characters or fewer.`;
    case 'task-tags-too-many':
      return `A task can have at most ${details.max ?? 12} tags.`;
    case 'backup-json-invalid':
      return 'Backup is not valid JSON.';
    case 'backup-object-invalid':
      return 'Backup must be a JSON object.';
    case 'backup-schema-invalid':
      return 'Unsupported or invalid TaskMint backup.';
    case 'backup-too-many-tasks':
      return 'Backup contains too many tasks.';
    case 'backup-duplicate-task-id':
      return `Backup contains duplicate task id: ${details.id ?? 'unknown'}`;
    case 'backup-task-invalid':
      return 'Invalid task in backup.';
    case 'backup-task-id-invalid':
      return 'Invalid task id.';
    case 'backup-task-title-invalid':
      return 'Invalid task title.';
    case 'backup-task-notes-too-long':
      return 'Task notes are too long.';
    case 'backup-task-project-too-long':
      return 'Task project is too long.';
    case 'backup-task-enum-invalid':
      return 'Invalid task enum value.';
    case 'backup-active-timestamps-invalid':
      return 'Active task contains incompatible completion/archive timestamps.';
    case 'backup-completed-timestamps-invalid':
      return 'Completed task contains incompatible completion/archive timestamps.';
    case 'backup-archived-timestamp-missing':
      return 'Archived task is missing archivedAt.';
    case 'backup-task-tags-invalid':
      return 'Invalid task tags.';
    case 'backup-task-tag-invalid':
      return 'Invalid task tag.';
    case 'backup-task-tags-too-many':
      return 'Task contains too many tags.';
    case 'backup-task-order-invalid':
      return 'Invalid task order.';
    case 'backup-settings-invalid':
      return 'Invalid settings in backup.';
    case 'backup-settings-theme-invalid':
      return 'Invalid settings theme.';
    case 'backup-field-invalid':
      return `Invalid ${details.field ?? 'field'}.`;
    case 'backup-file-too-large':
      return 'Backup file is too large.';
    case 'csv-file-too-large':
      return 'CSV file is too large.';
    case 'csv-too-many-tasks':
      return 'CSV contains too many tasks.';
    case 'csv-missing-columns':
      return `CSV is missing columns: ${(details.columns ?? []).join(', ')}`;
    case 'csv-duplicate-columns':
      return `CSV contains duplicate columns: ${(details.columns ?? []).join(', ')}`;
    case 'csv-invalid-priority':
      return `CSV row ${details.row ?? '?'} has an invalid priority.`;
    case 'csv-invalid-recurrence':
      return `CSV row ${details.row ?? '?'} has an invalid recurrence.`;
    case 'csv-invalid-status':
      return `CSV row ${details.row ?? '?'} has an invalid status.`;
    case 'csv-invalid-tags':
      return 'CSV contains an invalid structured tag field.';
    case 'csv-row-invalid':
      return `CSV row ${details.row ?? '?'}: ${details.causeMessage ?? 'Invalid task data.'}`;
    case 'csv-unterminated-quote':
      return 'CSV contains an unterminated quoted field.';
    case 'import-file-too-large':
      return 'Import file is too large.';
  }
}
