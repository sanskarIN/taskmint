import { useRef, useState, type KeyboardEvent } from 'react';
import { strings } from '../i18n/en';

interface Props {
  onComplete: () => Promise<void>;
}

export function Onboarding({ onComplete }: Props) {
  const startButton = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState('');

  async function start() {
    setError('');
    try {
      await onComplete();
    } catch {
      setError('Could not save the onboarding setting. Please try again.');
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
        onKeyDown={keepFocusInside}
      >
        <img className="onboarding-logo" src="/taskmint-icon.svg" alt="" width="72" height="72" />
        <p className="eyebrow">Welcome</p>
        <h2 id="onboarding-title">A calmer way to keep track.</h2>
        <p>{strings.tagline}</p>
        <ul className="feature-list">
          <li>Works offline and stores tasks locally.</li>
          <li>Organize with projects, tags, priorities, due dates, and recurring tasks.</li>
          <li>Export your data whenever you want.</li>
        </ul>
        <button
          ref={startButton}
          className="primary wide"
          type="button"
          onClick={start}
          autoFocus
        >
          Start using TaskMint
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="muted small">No account required.</p>
      </section>
    </div>
  );
}
