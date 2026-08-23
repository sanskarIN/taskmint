import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const nativeState = vi.hoisted(() => ({ enabled: true }));
const opener = vi.hoisted(() => ({ openUrl: vi.fn() }));

vi.mock('../src/platform/runtime', () => ({
  isNativeApp: () => nativeState.enabled
}));
vi.mock('@tauri-apps/plugin-opener', () => ({
  openUrl: opener.openUrl
}));

import { installExternalLinkHandler } from '../src/platform/links';

beforeEach(() => {
  nativeState.enabled = true;
  opener.openUrl.mockReset();
  opener.openUrl.mockResolvedValue(undefined);
  document.body.replaceChildren();
});

afterEach(() => {
  document.body.replaceChildren();
});

describe('native external link adapter', () => {
  it('opens supported external links through the operating system', async () => {
    const anchor = document.createElement('a');
    anchor.href = 'https://example.com/taskmint';
    anchor.innerHTML = '<span>Project site</span>';
    document.body.append(anchor);
    const cleanup = installExternalLinkHandler();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });

    anchor.querySelector('span')!.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    await vi.waitFor(() =>
      expect(opener.openUrl).toHaveBeenCalledWith('https://example.com/taskmint')
    );
    cleanup();
  });

  it('does not intercept unsupported protocols', async () => {
    const anchor = document.createElement('a');
    anchor.href = 'taskmint://local/action';
    document.body.append(anchor);
    const cleanup = installExternalLinkHandler();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });

    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(opener.openUrl).not.toHaveBeenCalled();
    cleanup();
  });

  it('leaves non-primary clicks untouched', () => {
    const anchor = document.createElement('a');
    anchor.href = 'https://example.com/secondary';
    document.body.append(anchor);
    const cleanup = installExternalLinkHandler();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 1 });

    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(opener.openUrl).not.toHaveBeenCalled();
    cleanup();
  });

  it('does nothing in the browser build', () => {
    nativeState.enabled = false;
    const anchor = document.createElement('a');
    anchor.href = 'https://example.com/browser';
    document.body.append(anchor);
    const cleanup = installExternalLinkHandler();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });

    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(opener.openUrl).not.toHaveBeenCalled();
    cleanup();
  });
});
