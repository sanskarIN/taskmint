import { useRef, useState, type KeyboardEvent } from 'react';
import { strings } from '../i18n/en';

interface Props {
  onComplete: () => Promise<void>;
}

export function Onboarding({ onComplete }: Props) {
  const startButton = useRef<HTMLButtonElement>(null);
  const completionLock = useRef(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function start() {
    if (completionLock.current) return;
    completionLock.current = true;
    setSubmitting(true);
    setError('');
    try {
      await onComplete();
    } catch {
      setError(strings.onboardingSaveError);
    } finally {
      completionLock.current = false;
      setSubmitting(false);
    }
  }

  function keepFocusInside(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    startButton.current?.focus();
  }

  return (
    <div className="modal-backdrop">
      <section
        className="modal onboarding card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-busy={submitting}
        onKeyDown={keepFocusInside}
      >
        <img className="onboarding-logo" src="/taskmint-icon.svg" alt="" width="72" height="72" />
        <p className="eyebrow">{strings.welcome}</p>
        <h2 id="onboarding-title">{strings.onboardingTitle}</h2>
        <p>{strings.tagline}</p>
        <ul className="feature-list">
          <li>{strings.onboardingOffline}</li>
          <li>{strings.onboardingOrganize}</li>
          <li>{strings.onboardingExport}</li>
        </ul>
        <button
          ref={startButton}
          className="primary wide"
          type="button"
          onClick={() => void start()}
          autoFocus
          disabled={submitting}
        >
          {strings.onboardingStart}
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="muted small">{strings.onboardingNoAccount}</p>
      </section>
    </div>
  );
}
