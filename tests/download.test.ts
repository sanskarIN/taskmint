import { describe, expect, it, vi } from 'vitest';
import { downloadText } from '../src/utils/export';

describe('download lifecycle', () => {
  it('clicks the download before revoking its object URL', async () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => 'blob:taskmint-test');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    await downloadText('taskmint-test.txt', 'hello', 'text/plain');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).not.toHaveBeenCalled();
    expect(document.querySelector('a[download="taskmint-test.txt"]')).toBeNull();

    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:taskmint-test');
  });
});
