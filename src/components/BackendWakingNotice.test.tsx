import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import type { WakeListener } from '@/lib/api';

// The wiring from a 502 to these listeners is covered in lib/api.test.ts; this
// file is about what the component does when it is told. Driving the listener
// directly keeps it out of the retry backoff, which fake timers and `waitFor`
// cannot share.
const listeners = new Set<WakeListener>();
vi.mock('@/lib/api', () => ({
  onBackendWaking: (listener: WakeListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
}));

const { BackendWakingNotice } = await import('./BackendWakingNotice');

const emit = (waking: boolean) => act(() => listeners.forEach((l) => l(waking)));

beforeEach(() => listeners.clear());

describe('BackendWakingNotice', () => {
  it('says nothing until something is actually waiting', () => {
    renderWithProviders(<BackendWakingNotice />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains the wait, then clears', async () => {
    renderWithProviders(<BackendWakingNotice />);

    // A judge tapping "Prijavi se" must not watch a dead button for 20 seconds
    // with no idea whether anything is happening.
    emit(true);
    expect(screen.getByRole('alert')).toHaveTextContent(/Server se budi/);

    emit(false);
    // The Snackbar keeps its child mounted through the exit transition.
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('stops listening when it unmounts', () => {
    const { unmount } = renderWithProviders(<BackendWakingNotice />);
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
