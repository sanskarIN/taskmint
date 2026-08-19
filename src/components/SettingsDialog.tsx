import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { AppSettings, ThemeMode } from '../domain/types';
import { strings } from '../i18n/en';

interface Props {
  open: boolean;
  settings: AppSettings;
  onClose: () => void;
  onChange: (settings: AppSettings) => Promise<void>;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportJson: (file: File) => Promise<void>;
  onImportCsv: (file: File) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  onEnableNotifications: () => Promise<void>;
}

export function SettingsDialog({
  open,
  settings,
  onClose,
  onChange,
  onExportJson,
  onExportCsv,
  onImportJson,
  onImportCsv,
  onDeleteAll,
  onEnableNotifications
}: Props) {
  const dialog = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const jsonInput = useRef<HTMLInputElement>(null);
  const csvInput = useRef<HTMLInputElement>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!open) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => closeButton.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  async function runAction(action: () => Promise<void>) {
    setActionError('');
    try {
      await action();
    } catch {
      setActionError('That setting could not be saved. Your existing local data was left in place.');
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>, type: 'json' | 'csv') {
    const file = event.target.files?.[0];
    if (!file) return;
    await runAction(async () => {
      if (type === 'json') await onImportJson(file);
      else await onImportCsv(file);
    });
    event.target.value = '';
  }

  function trapFocus(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !dialog.current) return;

    const focusable = Array.from(
      dialog.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.tabIndex >= 0);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialog}
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onKeyDown={trapFocus}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">TaskMint</p>
            <h2 id="settings-title">{strings.settings}</h2>
          </div>
          <button
            ref={closeButton}
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        {actionError && (
          <p className="form-error" role="alert">
            {actionError}
          </p>
        )}

        <div className="settings-section">
          <h3>Appearance & accessibility</h3>
          <label>
            Theme
            <select
              value={settings.theme}
              onChange={(event) =>
                void runAction(() =>
                  onChange({ ...settings, theme: event.target.value as ThemeMode })
                )
              }
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(event) =>
                void runAction(() =>
                  onChange({ ...settings, reduceMotion: event.target.checked })
                )
              }
            />
            Reduce motion
          </label>
        </div>

        <div className="settings-section">
          <h3>Reminders</h3>
          <p className="muted">
            Browser notifications are optional and only requested after you choose to enable them.
          </p>
          <button
            type="button"
            className="secondary"
            onClick={() => void runAction(onEnableNotifications)}
          >
            Enable browser notifications
          </button>
        </div>

        <div className="settings-section">
          <h3>Data & privacy</h3>
          <p className="muted">
            Your tasks are stored locally in this browser using IndexedDB. TaskMint does not require
            an account or server.
          </p>
          <div className="button-row">
            <button type="button" className="secondary" onClick={onExportJson}>
              Backup JSON
            </button>
            <button type="button" className="secondary" onClick={onExportCsv}>
              Export CSV
            </button>
            <button type="button" className="secondary" onClick={() => jsonInput.current?.click()}>
              Restore JSON
            </button>
            <button type="button" className="secondary" onClick={() => csvInput.current?.click()}>
              Import CSV
            </button>
          </div>
          <input
            ref={jsonInput}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            tabIndex={-1}
            onChange={(event) => void handleFile(event, 'json')}
          />
          <input
            ref={csvInput}
            className="sr-only"
            type="file"
            accept="text/csv,.csv"
            tabIndex={-1}
            onChange={(event) => void handleFile(event, 'csv')}
          />
          <button
            type="button"
            className="danger secondary"
            onClick={() => void runAction(onDeleteAll)}
          >
            Delete all local data
          </button>
        </div>

        <div className="settings-section">
          <h3>Updates</h3>
          <p className="muted">
            Installed PWA assets update automatically when a new service worker becomes available.
            Reload to activate any update already waiting in this browser.
          </p>
          <button type="button" className="secondary" onClick={() => window.location.reload()}>
            Reload TaskMint
          </button>
        </div>

        <div className="settings-section about-section">
          <h3>About</h3>
          <p>
            <strong>TaskMint v0.1.0</strong> · MIT License
          </p>
          <p>{strings.madeBy}</p>
          <div className="link-list">
            <a href="https://github.com/sanskarIN" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">
              Buy Me a Coffee
            </a>
            <a href="mailto:sanskarin@outlook.in">sanskarin@outlook.in</a>
            <a href="mailto:sanskarin.business@gmail.com">sanskarin.business@gmail.com</a>
            <a href="mailto:supportramsandesh@gmail.com">Support</a>
          </div>
        </div>
      </section>
    </div>
  );
}
