import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Onboarding } from '../src/components/Onboarding';
import { strings } from '../src/i18n/en';

describe('Onboarding', () => {
  it('prevents duplicate completion while the settings write is pending', async () => {
    let resolveComplete: (() => void) | undefined;
    const onComplete = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveComplete = resolve;
      })
    );

    render(<Onboarding onComplete={onComplete} />);
    const start = screen.getByRole('button', { name: strings.onboardingStart });

    fireEvent.click(start);
    fireEvent.click(start);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect((start as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('dialog').getAttribute('aria-busy')).toBe('true');

    resolveComplete?.();
    await vi.waitFor(() => {
      expect((screen.getByRole('button', { name: strings.onboardingStart }) as HTMLButtonElement).disabled).toBe(
        false
      );
    });
  });

  it('keeps storage failure details out of the user-facing error', async () => {
    const onComplete = vi.fn().mockRejectedValue(new Error('IndexedDB private implementation detail'));
    render(<Onboarding onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: strings.onboardingStart }));

    await vi.waitFor(() => expect(screen.getByRole('alert').textContent).toBe(strings.onboardingSaveError));
    expect(screen.getByRole('alert').textContent).not.toContain('IndexedDB private implementation detail');
  });
});
