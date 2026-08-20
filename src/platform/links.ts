import { logError } from '../utils/logger';
import { isNativeApp } from './runtime';

const externalProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function installExternalLinkHandler(): () => void {
  if (!isNativeApp()) return () => undefined;

  const handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const url = new URL(anchor.href, window.location.href);
    if (!externalProtocols.has(url.protocol)) return;

    event.preventDefault();
    void import('@tauri-apps/plugin-opener')
      .then(({ openUrl }) => openUrl(url.toString()))
      .catch((cause: unknown) => logError('external_link_failed', cause));
  };

  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}
