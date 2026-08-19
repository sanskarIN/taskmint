import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTask } from '../src/domain/task';

const mocks = vi.hoisted(() => ({
  listTasks: vi.fn(),
  getSettings: vi.fn(),
  putTask: vi.fn(),
  putTasks: vi.fn(),
  deleteTask: vi.fn(),
  saveSettings: vi.fn(),
  restoreBackup: vi.fn(),
  deleteAllLocalData: vi.fn()
}));

vi.mock('../src/storage/repository', () => ({
  defaultSettings: {
    key: 'app',
    theme: 'system',
    onboardingComplete: false,
    reduceMotion: false,
    notificationsEnabled: false
  },
  repository: mocks
}));

import App from '../src/App';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn());
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })
  });
  let id = 0;
  vi.stubGlobal('crypto', { randomUUID: () => `task-${++id}` });
  mocks.listTasks.mockReset();
  mocks.getSettings.mockReset();
  mocks.putTask.mockReset();
  mocks.putTasks.mockReset();
  mocks.deleteTask.mockReset();
  mocks.saveSettings.mockReset();
  mocks.restoreBackup.mockReset();
  mocks.deleteAllLocalData.mockReset();
});

describe('App task mutation gate', () => {
  it('prevents two different task rows from writing concurrently', async () => {
    const first = createTask({ title: 'First task' }, new Date('2026-08-19T08:00:00.000Z'), 10);
    const second = createTask({ title: 'Second task' }, new Date('2026-08-19T08:01:00.000Z'), 20);
    mocks.listTasks.mockResolvedValue([first, second]);
    mocks.getSettings.mockResolvedValue({
      key: 'app',
      theme: 'system',
      onboardingComplete: true,
      reduceMotion: false,
      notificationsEnabled: false
    });

    let releaseFirst: (() => void) | undefined;
    mocks.putTask
      .mockReturnValueOnce(
        new Promise<void>((resolve) => {
          releaseFirst = resolve;
        })
      )
      .mockResolvedValue(undefined);

    render(<App />);

    const firstComplete = await screen.findByRole('button', { name: 'Complete First task' });
    const secondComplete = screen.getByRole('button', { name: 'Complete Second task' });

    fireEvent.click(firstComplete);
    fireEvent.click(secondComplete);

    expect(mocks.putTask).toHaveBeenCalledTimes(1);
    expect((screen.getByRole('button', { name: 'Settings' }) as HTMLButtonElement).disabled).toBe(true);

    releaseFirst?.();
    await vi.waitFor(() => {
      expect((screen.getByRole('button', { name: 'Complete Second task' }) as HTMLButtonElement).disabled).toBe(
        false
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Complete Second task' }));
    await vi.waitFor(() => expect(mocks.putTask).toHaveBeenCalledTimes(2));
  });
});
