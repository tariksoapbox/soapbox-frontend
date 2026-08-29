import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { InlineGradeCell } from './InlineGradeCell';
import { mockApi, type Routes } from '@/lib/queries/test-server';

const LABEL = 'Ocjena — Buba Corelli — Lokumi — Kreativnost izrade vozila';

function setup(stored: number | undefined, routes: Routes = {}) {
  const api = mockApi({ 'PUT /admin/scores/t1/vehicle': { status: 204 }, ...routes });
  return {
    api,
    ...renderWithProviders(
      <InlineGradeCell
        teamId="t1"
        teamName="Lokumi"
        criterion="vehicle"
        judgeId="j1"
        judgeName="Buba Corelli"
        stored={stored}
      />,
    ),
  };
}

const field = () => screen.getByLabelText(LABEL);
const put = (api: { calls: { method: string; body: unknown }[] }) =>
  api.calls.find((c) => c.method === 'PUT')?.body;

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('InlineGradeCell', () => {
  it('shows the stored mark, or a blank', () => {
    const { unmount } = setup(9);
    expect(field()).toHaveValue('9');
    unmount();
    setup(undefined);
    expect(field()).toHaveValue('');
  });

  it('saves only this judge when the cell is left', async () => {
    const { api } = setup(undefined);
    await userEvent.type(field(), '9');
    expect(put(api)).toBeUndefined(); // not on keystroke
    await userEvent.tab();

    await waitFor(() => expect(put(api)).toBeDefined());
    // Just this judge — the API replaces only what it is given, so the rest of
    // the column is untouched.
    expect(put(api)).toEqual({ scores: [{ judgeId: 'j1', points: 9 }] });
  });

  it('saves a two-digit mark once, not as 1 then 10', async () => {
    const { api } = setup(undefined);
    await userEvent.type(field(), '10{Enter}');
    await waitFor(() => expect(put(api)).toBeDefined());
    expect(api.calls.filter((c) => c.method === 'PUT')).toHaveLength(1);
    expect(put(api)).toEqual({ scores: [{ judgeId: 'j1', points: 10 }] });
  });

  it('clearing sends null, never a zero', async () => {
    const { api } = setup(8);
    await userEvent.clear(field());
    await userEvent.tab();
    await waitFor(() => expect(put(api)).toBeDefined());
    expect(put(api)).toEqual({ scores: [{ judgeId: 'j1', points: null }] });
  });

  it('does not write when nothing changed', async () => {
    const { api } = setup(8);
    await userEvent.click(field());
    await userEvent.tab();
    expect(api.calls.some((c) => c.method === 'PUT')).toBe(false);
  });

  it('puts the stored mark back when the write is refused', async () => {
    setup(8, {
      'PUT /admin/scores/t1/vehicle': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    await userEvent.clear(field());
    await userEvent.type(field(), '3');
    await userEvent.tab();
    // The grid must never show a number the server does not have.
    await waitFor(() => expect(field()).toHaveValue('8'));
  });
});
