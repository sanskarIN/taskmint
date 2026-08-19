import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { APP_VERSION } from '../config';
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
  const actionLock = useRef(false);
  const [actionError, setActionError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActionError('');
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => closeButton.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  async function runAction(action: () => Promise<void>, failureMessage = strings.settingsSaveError) {
    if (actionLock.current) return;
    actionLock.current = true;
    setActionBusy(true);
    setActionError('');
    try {
      await action();
    } catch {
      setActionError(failureMessage);
    } finally {
      actionLock.current = false;
      setActionBusy(false);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>, type: 'json' | 'csv') {
    const file = event.target.files?.[0];
    if (!file || actionLock.current) return;
    await runAction(async () => {
      if (type === 'json') await onImportJson(file);
      else await onImportCsv(file);
    });
    event.target.value = '';
  }

  function trapFocus(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      if (actionBusy) return;
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
        if (!actionBusy && event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialog}
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        aria-busy={actionBusy}
        onKeyDown={trapFocus}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{strings.appName}</p>
            <h2 id="settings-title">{strings.settings}</h2>
          </div>
          <button
            ref={closeButton}
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label={strings.closeSettings}
            disabled={actionBusy}
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
          <h3>{strings.appearanceAccessibility}</h3>
          <label>
            {strings.theme}
            <select
              value={settings.theme}
              disabled={actionBusy}
              onChange={(event) => {
                const theme = event.target.value as ThemeMode;
                void runAction(() => onChange({ ...settings, theme }));
              }}
            >
              <option value="system">{strings.themeSystem}</option>
              <option value="light">{strings.themeLight}</option>
              <option value="dark">{strings.themeDark}</option>
            </select>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              disabled={actionBusy}
              onChange={(event) => {
                const reduceMotion = event.target.checked;
                void runAction(() => onChange({ ...settings, reduceMotion }));
              }}
            />
            {strings.reduceMotion}
          </label>
        </div>

        <div className="settings-section">
          <h3>{strings.reminders}</h3>
          <p className="muted">{strings.remindersDescription}</p>
          <button
            type="button"
            className="secondary"
            disabled={actionBusy}
            onClick={() => void runAction(onEnableNotifications)}
          >
            {strings.enableBrowserNotifications}
          </button>
        </div>

        <div className="settings-section">
          <h3>{strings.dataPrivacy}</h3>
          <p className="muted">{strings.dataPrivacyDescription}</p>
          <div className="button-row">
            <button
              type="button"
              className="secondary"
              disabled={actionBusy}
              onClick={() => void runAction(async () => onExportJson(), strings.exportError)}
            >
              {strings.backupJson}
            </button>
            <button
              type="button"
              className="secondary"
              disabled={actionBusy}
              onClick={() => void runAction(async () => onExportCsv(), strings.exportError)}
            >
              {strings.exportCsv}
            </button>
            <button
              type="button"
              className="secondary"
              disabled={actionBusy}
              onClick={() => jsonInput.current?.click()}
            >
              {strings.restoreJson}
            </button>
            <button
              type="button"
              className="secondary"
              disabled={actionBusy}
              onClick={() => csvInput.current?.click()}
            >
              {strings.importCsv}
            </button>
          </div>
          <input
            ref={jsonInput}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            tabIndex={-1}
            disabled={actionBusy}
            onChange={(event) => void handleFile(event, 'json')}
          />
          <input
            ref={csvInput}
            className="sr-only"
            type="file"
            accept="text/csv,.csv"
            tabIndex={-1}
            disabled={actionBusy}
            onChange={(event) => void handleFile(event, 'csv')}
          />
          <button
            type="button"
            className="danger secondary"
            disabled={actionBusy}
            onClick={() => void runAction(onDeleteAll)}
          >
            {strings.deleteAllLocalData}
          </button>
        </div>

        <div className="settings-section">
          <h3>{strings.updates}</h3>
          <p className="muted">{strings.updatesDescription}</p>
          <button
            type="button"
            className="secondary"
            disabled={actionBusy}
            onClick={() => window.location.reload()}
          >
            {strings.reloadTaskMint}
          </button>
        </div>

        <div className="settings-section about-section">
          <h3>{strings.about}</h3>
          <p>
            <strong>{strings.appName} v{APP_VERSION}</strong> · {strings.mitLicense}
          </p>
          <p>{strings.madeBy}</p>
          <div className="link-list">
            <a href="https://github.com/sanskarIN" target="_blank" rel="noreferrer">
              {strings.github}
            </a>
            <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">
              {strings.buyMeACoffee}
            </a>
            <a href="mailto:sanskarin@outlook.in">sanskarin@outlook.in</a>
            <a href="mailto:sanskarin.business@gmail.com">sanskarin.business@gmail.com</a>
            <a href="mailto:supportramsandesh@gmail.com">{strings.support}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
