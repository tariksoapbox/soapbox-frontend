import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { ScoresTab } from './ScoresTab';
import { judge, score, team } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';

const panel = [
  { id: 'j1', name: 'Buba Corelli', isActive: true },
  { id: 'j2', name: 'Mate Rimac', isActive: true },
];

function setup(routes: Routes = {}) {
  const api = mockApi({
    'GET /teams': { teams: [team()] },
    'GET /admin/judges': { judges: [judge(), judge({ id: 'j2', name: 'Mate Rimac' })] },
    'GET /admin/scores': { judges: panel, scores: [] },
    ...routes,
  });
  return { api, ...renderWithProviders(<ScoresTab />) };
}

const openCell = async (criterion: string) =>
  userEvent.click(await screen.findByRole('button', { name: new RegExp(criterion) }));

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('ScoresTab', () => {
  it('shows a cell per team and criterion, with nothing entered yet', async () => {
    setup();
    expect(await screen.findByText('Leteći Bosanci')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Kreativnost izrade vozila' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Kreativnost nastupa' })).toBeInTheDocument();
    expect(screen.getAllByText('0/2 uneseno')).toHaveLength(2);
  });

  it('shows the running total and progress once marks exist', async () => {
    setup({
      'GET /admin/scores': {
        judges: panel,
        scores: [score({ judgeId: 'j1', points: 9 })],
      },
    });
    await screen.findByText('Leteći Bosanci');
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('1/2 uneseno')).toBeInTheDocument();
  });

  it('opens a modal for ONE criterion, listing every judge', async () => {
    setup();
    await openCell('Kreativnost izrade vozila — Leteći Bosanci');

    const dialog = await screen.findByRole('dialog');
    // Scoped to a single criterion, not all of them at once.
    expect(
      within(dialog).getByText('Kreativnost izrade vozila — Leteći Bosanci'),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText(/Kreativnost nastupa/)).not.toBeInTheDocument();
    // One 1–10 scale per judge.
    expect(within(dialog).getByText('Buba Corelli')).toBeInTheDocument();
    expect(within(dialog).getByText('Mate Rimac')).toBeInTheDocument();
    expect(within(dialog).getAllByRole('radiogroup')).toHaveLength(2);
  });

  it('saves the whole panel in one write', async () => {
    const { api } = setup({ 'PUT /admin/scores/t1/vehicle': { status: 204 } });
    await openCell('Kreativnost izrade vozila — Leteći Bosanci');
    const dialog = await screen.findByRole('dialog');

    const [buba, mate] = within(dialog).getAllByRole('radiogroup');
    await userEvent.click(within(buba!).getByRole('radio', { name: '9' }));
    await userEvent.click(within(mate!).getByRole('radio', { name: '7' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Spremi' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'PUT')).toBe(true));
    const put = api.calls.find((c) => c.method === 'PUT')!;
    expect(put.path).toBe('/admin/scores/t1/vehicle');
    expect(put.body).toEqual({
      scores: [
        { judgeId: 'j1', points: 9 },
        { judgeId: 'j2', points: 7 },
      ],
    });
  });

  it('opens filled with the marks already recorded', async () => {
    setup({
      'GET /admin/scores': { judges: panel, scores: [score({ judgeId: 'j1', points: 8 })] },
    });
    await openCell('Kreativnost izrade vozila — Leteći Bosanci');
    const dialog = await screen.findByRole('dialog');
    const [buba] = within(dialog).getAllByRole('radiogroup');
    expect(within(buba!).getByRole('radio', { name: '8' })).toHaveAttribute('aria-checked', 'true');
  });

  it('running total and progress update as you type', async () => {
    setup();
    await openCell('Kreativnost izrade vozila — Leteći Bosanci');
    const dialog = await screen.findByRole('dialog');
    const [buba] = within(dialog).getAllByRole('radiogroup');
    await userEvent.click(within(buba!).getByRole('radio', { name: '9' }));
    // Scoped to the footer: "9" is also the label of the key that was tapped.
    const footer = within(dialog).getByText('Ukupno').parentElement!;
    expect(footer).toHaveTextContent('9');
    expect(footer).toHaveTextContent('1/2 uneseno');
  });

  it('clears one judge back to blank rather than to a zero', async () => {
    const { api } = setup({
      'GET /admin/scores': { judges: panel, scores: [score({ judgeId: 'j1', points: 8 })] },
      'PUT /admin/scores/t1/vehicle': { status: 204 },
    });
    await openCell('Kreativnost izrade vozila — Leteći Bosanci');
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getAllByRole('button', { name: 'Obriši' })[0]!);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Spremi' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'PUT')).toBe(true));
    expect(api.calls.find((c) => c.method === 'PUT')!.body).toEqual({
      scores: [
        { judgeId: 'j1', points: null },
        { judgeId: 'j2', points: null },
      ],
    });
  });

  it('cancels without writing anything', async () => {
    const { api } = setup();
    await openCell('Kreativnost izrade vozila — Leteći Bosanci');
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odustani' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.calls.some((c) => c.method === 'PUT')).toBe(false);
  });

  it("surfaces the API's refusal and stays open", async () => {
    setup({
      'PUT /admin/scores/t1/vehicle': {
        status: 404,
        body: { error: 'Sudija ne postoji.', code: 'JUDGE_NOT_FOUND' },
      },
    });
    await openCell('Kreativnost izrade vozila — Leteći Bosanci');
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Spremi' }));
    expect(await screen.findByText('Sudija ne postoji.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('points the admin at the Judges tab when the panel is empty', async () => {
    setup({ 'GET /admin/judges': { judges: [] }, 'GET /admin/scores': { judges: [], scores: [] } });
    expect(await screen.findByText(/Nema aktivnih sudija/)).toBeInTheDocument();
  });

  it('says so when there are no teams', async () => {
    setup({ 'GET /teams': { teams: [] } });
    expect(await screen.findByText(/Još nema ekipa/)).toBeInTheDocument();
  });

  it('reports a failed load and retries', async () => {
    const { api } = setup({
      'GET /admin/scores': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Greška na serveru.');
    const before = api.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pokušajte ponovo' }));
    await waitFor(() => expect(api.calls.length).toBeGreaterThan(before));
  });
});
