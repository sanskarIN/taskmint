import { describe, expect, it } from 'vitest';
import { createTask } from '../src/domain/task';
import { csvToTasks, parseBackup, serializeBackup, tasksToCsv } from '../src/utils/export';

function deterministicGenerator(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state;
  };
}

function generatedText(next: () => number, length: number): string {
  const alphabet = ['a', 'B', '7', ' ', ',', '"', '\n', '\r', '|', '[', ']', ':', '✓', 'न', 'म'];
  return Array.from({ length }, () => alphabet[next() % alphabet.length]).join('');
}

describe('deterministic portability properties', () => {
  it('round-trips a broad deterministic CSV corpus without losing task fields', () => {
    const next = deterministicGenerator(0x5eed1234);
    const tasks = Array.from({ length: 256 }, (_, index) =>
      createTask({
        title: `Task ${index} ${generatedText(next, 20)}`,
        notes: `note-${index}:${generatedText(next, 80)}`,
        tags: Array.from({ length: 1 + (next() % 4) }, (_, tagIndex) =>
          `tag-${tagIndex}-${generatedText(next, 12)}`
        ),
        project: `project-${generatedText(next, 12)}`,
        priority: (['low', 'medium', 'high', 'urgent'] as const)[index % 4],
        dueDate: `2026-08-${String(1 + (index % 28)).padStart(2, '0')}`,
        recurrence: (['none', 'daily', 'weekly', 'monthly'] as const)[index % 4]
      })
    );

    const imported = csvToTasks(tasksToCsv(tasks));
    expect(imported).toHaveLength(tasks.length);
    for (let index = 0; index < tasks.length; index += 1) {
      expect(imported[index]).toMatchObject({
        title: tasks[index]?.title,
        notes: tasks[index]?.notes,
        tags: tasks[index]?.tags,
        project: tasks[index]?.project,
        priority: tasks[index]?.priority,
        dueDate: tasks[index]?.dueDate,
        recurrence: tasks[index]?.recurrence,
        status: tasks[index]?.status
      });
    }
  });

  it('round-trips deterministic JSON backups without changing task data', () => {
    const next = deterministicGenerator(0x1badb002);
    const tasks = Array.from({ length: 128 }, (_, index) =>
      createTask(
        {
          title: `Backup ${index} ${generatedText(next, 14)}`,
          notes: generatedText(next, 48),
          tags: [`json-${generatedText(next, 10)}`, `pipe|${index}`],
          project: `P-${index % 9}`,
          recurrence: index % 2 === 0 ? 'weekly' : 'none'
        },
        new Date('2026-08-19T05:00:00.000Z'),
        index * 1000
      )
    );

    const parsed = parseBackup(serializeBackup(tasks));
    expect(parsed.tasks).toEqual(tasks);
  });

  it('rejects malformed structured CSV tag payloads instead of coercing them', () => {
    const header =
      'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status,taskmintEncoding\r\n';
    for (const tags of ['json:', 'json:{}', 'json:[1,2]', 'json:["ok",3]', 'json:not-json']) {
      const escaped = `"${tags.replaceAll('"', '""')}"`;
      const csv = `${header}Malformed tags,,medium,,,${escaped},,none,active,safe-text-v1`;
      expect(() => csvToTasks(csv)).toThrow(/invalid structured tag field/i);
    }
  });
});
