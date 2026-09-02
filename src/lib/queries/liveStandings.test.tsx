import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryKeys } from './keys';
import type { PublicStandings } from '@/schemas/contracts';

/** A stand-in socket, so the hook is tested without a server. */
const handlers = new Map<string, (payload: unknown) => void>();
const socket = {
  on: vi.fn((event: string, fn: (payload: unknown) => void) => handlers.set(event, fn)),
  off: vi.fn((event: string) => handlers.delete(event)),
  disconnect: vi.fn(),
};
const io = vi.fn(() => socket);
vi.mock('socket.io-client', () => ({ io: (...args: unknown[]) => io(...(args as [])) }));

const { useLiveStandings, STANDINGS_EVENT } = await import('./liveStandings');

const standings = { event: { teamCount: 3 }, teams: [] } as unknown as PublicStandings;

function setup(origin: string | undefined) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Probe() {
    useLiveStandings(origin);
    return null;
  }
  const view = render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );
  return { client, ...view };
}

beforeEach(() => {
  vi.clearAllMocks();
  handlers.clear();
});
afterEach(() => vi.restoreAllMocks());

describe('useLiveStandings', () => {
  it('does not open a connection without an origin', () => {
    // Nothing to connect to, and the board still polls — a missing origin
    // costs freshness, not the page.
    setup(undefined);
    expect(io).not.toHaveBeenCalled();
  });

  it('talks to the API directly, without a cookie', () => {
    setup('https://api.example.com');
    // The /api proxy exists to keep the session cookie first-party. This feed
    // carries no cookie and needs no session, so it goes straight there.
    expect(io).toHaveBeenCalledWith(
      'https://api.example.com',
      expect.objectContaining({ withCredentials: false }),
    );
  });

  it('writes a pushed board into the same cache the poll fills', async () => {
    const { client } = setup('https://api.example.com');
    handlers.get(STANDINGS_EVENT)?.(standings);

    // One source of truth: the fetch and the push cannot show different boards.
    await waitFor(() => {
      expect(client.getQueryData(queryKeys.publicBoard)).toEqual(standings);
    });
  });

  it('lets go of the socket when the board goes away', () => {
    const { unmount } = setup('https://api.example.com');
    unmount();
    expect(socket.off).toHaveBeenCalledWith(STANDINGS_EVENT);
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('reconnects to a new origin rather than leaking the old socket', () => {
    const { rerender, client } = setup('https://one.example.com');
    rerender(
      <QueryClientProvider client={client}>
        <ProbeFor origin="https://two.example.com" />
      </QueryClientProvider>,
    );
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenLastCalledWith('https://two.example.com', expect.anything());
  });
});

function ProbeFor({ origin }: { origin: string }) {
  useLiveStandings(origin);
  return null;
}
