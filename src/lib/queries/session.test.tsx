import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLogout, useSession } from './session';
import { queryKeys } from './keys';
import { mockApi } from './test-server';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

function harness() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

const judge = { id: 'u1', username: 'sudija1', displayName: 'Sudija 1', role: 'referee' };

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('useSession', () => {
  it('reads the signed-in user', async () => {
    mockApi({ 'GET /auth/session': { user: judge } });
    const { wrapper } = harness();
    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(judge));
  });
});

describe('useLogout', () => {
  it('empties the whole cache and returns to the login screen', async () => {
    mockApi({ 'GET /auth/session': { user: judge }, 'POST /auth/logout': { status: 204 } });
    const { queryClient, wrapper } = harness();
    queryClient.setQueryData(queryKeys.session, judge);
    // Something another user must not inherit on a shared phone.
    queryClient.setQueryData(queryKeys.ballot, { teams: [], remaining: 0 });

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/prijava'));
    expect(queryClient.getQueryData(queryKeys.ballot)).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.session)).toBeUndefined();
  });

  it('still clears and redirects when the sign-out call itself fails', async () => {
    mockApi({ 'POST /auth/logout': { status: 500, body: { error: 'Greška.' } } });
    const { queryClient, wrapper } = harness();
    queryClient.setQueryData(queryKeys.session, judge);

    const { result } = renderHook(() => useLogout(), { wrapper });
    result.current.mutate();

    // The local session is gone either way — never strand someone signed in.
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/prijava'));
    expect(queryClient.getQueryData(queryKeys.session)).toBeUndefined();
  });
});
