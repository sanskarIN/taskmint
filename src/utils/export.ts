import type { AppSettings, Task, TaskBackup } from '../domain/types';
import { validateBackup } from '../domain/validation';
import { createTask } from '../domain/task';

const csvHeaders = [
  'title',
  'notes',
  'priority',
  'dueDate',
  'reminderAt',
  'tags',
  'project',
  'recurrence',
  'status'
] as const;

export function createBackup(tasks: Task[], settings?: AppSettings): TaskBackup {
  return {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    app: 'TaskMint',
    tasks,
    ...(settings ? { settings } : {})
  };
}

export function serializeBackup(tasks: Task[], settings?: AppSettings): string {
  return JSON.stringify(createBackup(tasks, settings), null, 2);
}

export function parseBackup(text: string): TaskBackup {
  if (text.length > 25_000_000) throw new Error('Backup file is too large.');
  return validateBackup(JSON.parse(text) as unknown);
}

export function tasksToCsv(tasks: Task[]): string {
  const rows = [csvHeaders.join(',')];
  for (const task of tasks) {
    rows.push(
      [
        task.title,
        task.notes,
        task.priority,
        task.dueDate ?? '',
        task.reminderAt ?? '',
        task.tags.join('|'),
        task.project,
        task.recurrence,
        task.status
      ]
        .map(csvCell)
        .join(',')
    );
  }
  return rows.join('\r\n');
}

export function csvToTasks(csv: string): Task[] {
  if (csv.length > 25_000_000) throw new Error('CSV file is too large.');
  const rows = parseCsv(csv);
  if (rows.length === 0) return [];
  const headers = rows[0]?.map((h) => h.trim()) ?? [];
  const missing = csvHeaders.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`CSV is missing columns: ${missing.join(', ')}`);
  return rows.slice(1).filter((row) => row.some(Boolean)).map((row, index) => {
    const value = (name: (typeof csvHeaders)[number]) => row[headers.indexOf(name)] ?? '';
    const priority = value('priority');
    const recurrence = value('recurrence');
    const task = createTask(
      {
        title: value('title'),
        notes: value('notes'),
        priority: priority === 'low' || priority === 'high' || priority === 'urgent' ? priority : 'medium',
        dueDate: value('dueDate') || null,
        reminderAt: value('reminderAt') || null,
        tags: value('tags').split('|').filter(Boolean),
        project: value('project'),
        recurrence:
          recurrence === 'daily' || recurrence === 'weekly' || recurrence === 'monthly'
            ? recurrence
            : 'none'
      },
      new Date(),
      Date.now() + index
    );
    const status = value('status');
    if (status === 'completed') {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
    } else if (status === 'archived') {
      task.status = 'archived';
      task.archivedAt = new Date().toISOString();
    }
    return task;
  });
}

export function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === '') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV contains an unterminated quoted field.');
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}
