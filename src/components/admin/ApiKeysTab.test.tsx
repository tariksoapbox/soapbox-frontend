import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { ApiKeysTab } from './ApiKeysTab';
import { mockApi, type Routes } from '@/lib/queries/test-server';
import type { ApiKey } from '@/schemas/contracts';

function apiKey(overrides: Partial<ApiKey> = {}): ApiKey {
  return {
    id: 'k1',
    name: 'Partnerska aplikacija',
    prefix: 'sbx_9f3a2b1c',
    lastUsedAt: null,
    revokedAt: null,
    createdAt: '2026-08-29T10:00:00.000Z',
    ...overrides,
  };
}

function setup(routes: Routes = {}) {
  const api = mockApi({ 'GET /admin/api-keys': { keys: [] }, ...routes });
  return { api, ...renderWithProviders(<ApiKeysTab />) };
}

const row = (name: string) => screen.getByRole('row', { name: new RegExp(name) });

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('ApiKeysTab', () => {
  it('explains what a key is for, and how to use it', async () => {
    setup();
    expect(await screen.findByText(/Druge aplikacije mogu čitati rang listu/)).toBeInTheDocument();
    const docs = screen.getByRole('region', { name: 'Kako se koristi' });
    expect(docs).toHaveTextContent('Authorization: Bearer');
    expect(docs).toHaveTextContent('/v1/standings');
    // Says what the caller actually gets back.
    expect(docs).toHaveTextContent(/ocjenu svakog sudije/);
  });

  it('creates a key and shows it exactly once, behind an acknowledgement', async () => {
    const { api } = setup({
      'POST /admin/api-keys': { key: apiKey(), secret: 'sbx_9f3a2b1c-supersecret' },
    });
    await userEvent.type(screen.getByLabelText('Naziv'), 'Partnerska aplikacija');
    await userEvent.click(screen.getByRole('button', { name: 'Novi ključ' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'POST')).toBe(true));
    expect(api.calls.find((c) => c.method === 'POST')!.body).toEqual({
      name: 'Partnerska aplikacija',
    });

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('sbx_9f3a2b1c-supersecret')).toBeInTheDocument();
    // The server keeps a hash, so this is the last sighting — say so.
    expect(within(dialog).getByText(/jedini put da vidite ključ/)).toBeInTheDocument();
  });

  it('will not let the key dialog be dismissed by a stray click', async () => {
    setup({ 'POST /admin/api-keys': { key: apiKey(), secret: 'sbx_secret' } });
    await userEvent.type(screen.getByLabelText('Naziv'), 'Partnerska aplikacija');
    await userEvent.click(screen.getByRole('button', { name: 'Novi ključ' }));

    const dialog = await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    // Losing a credential to an accidental Escape means issuing another one.
    expect(dialog).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Sačuvao sam ključ' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('validates the label before spending a round-trip', async () => {
    const { api } = setup();
    await userEvent.type(screen.getByLabelText('Naziv'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Novi ključ' }));
    expect(await screen.findByText(/najmanje 2 znaka/)).toBeInTheDocument();
    expect(api.calls.some((c) => c.method === 'POST')).toBe(false);
  });

  it('lists a key by its visible head, never the key itself', async () => {
    setup({
      'GET /admin/api-keys': { keys: [apiKey({ lastUsedAt: '2026-08-29T11:00:00.000Z' })] },
    });
    await screen.findByText('Partnerska aplikacija');
    const line = row('Partnerska aplikacija');
    expect(within(line).getByText('sbx_9f3a2b1c…')).toBeInTheDocument();
    expect(within(line).getByText('Aktivan')).toBeInTheDocument();
  });

  it('says when a key has never been used', async () => {
    setup({ 'GET /admin/api-keys': { keys: [apiKey()] } });
    await screen.findByText('Partnerska aplikacija');
    expect(within(row('Partnerska aplikacija')).getByText('Nije korišten')).toBeInTheDocument();
  });

  it('revokes a key after spelling out the consequence', async () => {
    const { api } = setup({
      'GET /admin/api-keys': { keys: [apiKey()] },
      'DELETE /admin/api-keys/k1': { status: 204 },
    });
    await screen.findByText('Partnerska aplikacija');
    await userEvent.click(
      within(row('Partnerska aplikacija')).getByRole('button', { name: 'Poništi' }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/odmah gubi pristup/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Poništi' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'DELETE')).toBe(true));
  });

  it('backs out of a revoke without touching the key', async () => {
    const { api } = setup({ 'GET /admin/api-keys': { keys: [apiKey()] } });
    await screen.findByText('Partnerska aplikacija');
    await userEvent.click(
      within(row('Partnerska aplikacija')).getByRole('button', { name: 'Poništi' }),
    );
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odustani' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.calls.some((c) => c.method === 'DELETE')).toBe(false);
  });

  it('keeps a revoked key on the list, with no way to revoke it again', async () => {
    setup({
      'GET /admin/api-keys': {
        keys: [
          apiKey({ revokedAt: '2026-08-29T12:00:00.000Z', lastUsedAt: '2026-08-29T11:00:00.000Z' }),
        ],
      },
    });
    await screen.findByText('Partnerska aplikacija');
    const line = row('Partnerska aplikacija');
    // History: which integration went quiet, and when.
    expect(within(line).getByText('Poništen')).toBeInTheDocument();
    expect(within(line).queryByRole('button', { name: 'Poništi' })).not.toBeInTheDocument();
  });

  it('says so when there are no keys yet', async () => {
    setup();
    expect(await screen.findByText('Još nema ključeva.')).toBeInTheDocument();
  });

  it('reports a failed load and retries', async () => {
    const { api } = setup({
      'GET /admin/api-keys': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Greška na serveru.');
    const before = api.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pokušajte ponovo' }));
    await waitFor(() => expect(api.calls.length).toBeGreaterThan(before));
  });
});
