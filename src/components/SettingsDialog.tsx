import { useRef, type ChangeEvent } from 'react';
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
  const jsonInput = useRef<HTMLInputElement>(null);
  const csvInput = useRef<HTMLInputElement>(null);
  if (!open) return null;

  async function handleFile(event: ChangeEvent<HTMLInputElement>, type: 'json' | 'csv') {
    const file = event.target.files?.[0];
    if (!file) return;
    if (type === 'json') await onImportJson(file);
    else await onImportCsv(file);
    event.target.value = '';
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal-header">
          <div><p className="eyebrow">TaskMint</p><h2 id="settings-title">{strings.settings}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close settings">×</button>
        </div>

        <div className="settings-section">
          <h3>Appearance & accessibility</h3>
          <label>Theme<select value={settings.theme} onChange={(event) => onChange({ ...settings, theme: event.target.value as ThemeMode })}>
            <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
          </select></label>
          <label className="checkbox-row"><input type="checkbox" checked={settings.reduceMotion} onChange={(event) => onChange({ ...settings, reduceMotion: event.target.checked })} /> Reduce motion</label>
        </div>

        <div className="settings-section">
          <h3>Reminders</h3>
          <p className="muted">Browser notifications are optional and only requested after you choose to enable them.</p>
          <button type="button" className="secondary" onClick={onEnableNotifications}>Enable browser notifications</button>
        </div>

        <div className="settings-section">
          <h3>Data & privacy</h3>
          <p className="muted">Your tasks are stored locally in this browser using IndexedDB. TaskMint does not require an account or server.</p>
          <div className="button-row">
            <button type="button" className="secondary" onClick={onExportJson}>Backup JSON</button>
            <button type="button" className="secondary" onClick={onExportCsv}>Export CSV</button>
            <button type="button" className="secondary" onClick={() => jsonInput.current?.click()}>Restore JSON</button>
            <button type="button" className="secondary" onClick={() => csvInput.current?.click()}>Import CSV</button>
          </div>
          <input ref={jsonInput} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => handleFile(event, 'json')} />
          <input ref={csvInput} className="sr-only" type="file" accept="text/csv,.csv" onChange={(event) => handleFile(event, 'csv')} />
          <button type="button" className="danger secondary" onClick={onDeleteAll}>Delete all local data</button>
        </div>

        <div className="settings-section">
          <h3>Updates</h3>
          <p className="muted">Installed PWA assets update automatically when a new service worker becomes available. Reload to activate any update already waiting in this browser.</p>
          <button type="button" className="secondary" onClick={() => window.location.reload()}>Reload TaskMint</button>
        </div>

        <div className="settings-section about-section">
          <h3>About</h3>
          <p><strong>TaskMint v0.1.0</strong> · MIT License</p>
          <p>{strings.madeBy}</p>
          <div className="link-list">
            <a href="https://github.com/sanskarIN" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">Buy Me a Coffee</a>
            <a href="mailto:sanskarin@outlook.in">sanskarin@outlook.in</a>
            <a href="mailto:sanskarin.business@gmail.com">sanskarin.business@gmail.com</a>
            <a href="mailto:supportramsandesh@gmail.com">Support</a>
          </div>
        </div>
      </section>
    </div>
  );
}
