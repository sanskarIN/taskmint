import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { strings } from '../i18n/en';
import { isNativeApp } from '../platform/runtime';
import { logError } from '../utils/logger';
import './PwaUpdatePrompt.css';

export function PwaUpdatePrompt() {
  if (isNativeApp()) return null;
  return <WebPwaUpdatePrompt />;
}

function WebPwaUpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState('');
  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisterError(cause) {
      logError('pwa_register_failed', cause);
    }
  });

  if (!needRefresh || dismissed) return null;

  async function activateUpdate() {
    setError('');
    try {
      await updateServiceWorker(true);
    } catch (cause) {
      logError('pwa_update_failed', cause);
      setError(strings.updateFailed);
    }
  }

  return (
    <aside className="toast update-prompt" aria-live="polite" aria-label={strings.updateAvailableTitle}>
      <div>
        <strong>{strings.updateAvailableTitle}</strong>
        <p>{error || strings.updateAvailableBody}</p>
      </div>
      <div className="update-prompt-actions">
        <button type="button" onClick={() => void activateUpdate()}>
          {strings.updateNow}
        </button>
        <button type="button" onClick={() => setDismissed(true)}>
          {strings.updateLater}
        </button>
      </div>
    </aside>
  );
}
