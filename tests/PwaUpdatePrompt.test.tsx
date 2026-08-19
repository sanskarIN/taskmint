import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { strings } from '../src/i18n/en';

const mocks = vi.hoisted(() => ({
  updateServiceWorker: vi.fn()
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [true, vi.fn()],
    updateServiceWorker: mocks.updateServiceWorker
  })
}));

import { PwaUpdatePrompt } from '../src/components/PwaUpdatePrompt';

describe('PwaUpdatePrompt', () => {
  beforeEach(() => {
    mocks.updateServiceWorker.mockReset();
  });

  it('prevents duplicate update activation while a reload request is pending', async () => {
    let resolveUpdate: (() => void) | undefined;
    mocks.updateServiceWorker.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      })
    );

    render(<PwaUpdatePrompt />);
    const update = screen.getByRole('button', { name: strings.updateNow });

    fireEvent.click(update);
    fireEvent.click(update);

    expect(mocks.updateServiceWorker).toHaveBeenCalledTimes(1);
    expect(mocks.updateServiceWorker).toHaveBeenCalledWith(true);
    expect((update as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByLabelText(strings.updateAvailableTitle).getAttribute('aria-busy')).toBe('true');

    resolveUpdate?.();
    await vi.waitFor(() => {
      expect((screen.getByRole('button', { name: strings.updateNow }) as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it('shows a safe update failure message and allows retry', async () => {
    mocks.updateServiceWorker.mockRejectedValueOnce(new Error('service worker private detail'));
    render(<PwaUpdatePrompt />);

    fireEvent.click(screen.getByRole('button', { name: strings.updateNow }));

    await vi.waitFor(() => expect(screen.getByText(strings.updateFailed)).toBeDefined());
    expect(document.body.textContent).not.toContain('service worker private detail');
    expect((screen.getByRole('button', { name: strings.updateNow }) as HTMLButtonElement).disabled).toBe(false);
  });
});
