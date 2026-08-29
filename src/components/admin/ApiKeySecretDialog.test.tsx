import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { ApiKeySecretDialog } from './ApiKeySecretDialog';

const SECRET = 'sbx_9f3a2b1c-supersecret';

function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  // Leave the global as we found it for the next spec.
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('ApiKeySecretDialog', () => {
  it('renders nothing until there is a key to show', () => {
    renderWithProviders(<ApiKeySecretDialog secret={null} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the key and warns that it will not be shown again', () => {
    renderWithProviders(<ApiKeySecretDialog secret={SECRET} onClose={vi.fn()} />);
    expect(screen.getByText(SECRET)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/jedini put/);
  });

  it('copies to the clipboard and confirms it', async () => {
    const writeText = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    stubClipboard(writeText);
    renderWithProviders(<ApiKeySecretDialog secret={SECRET} onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Kopiraj' }));
    expect(writeText).toHaveBeenCalledWith(SECRET);
    await waitFor(() => expect(screen.getByLabelText('Kopiraj')).toBeInTheDocument());
  });

  it('survives the clipboard being refused — the key is on screen anyway', async () => {
    stubClipboard(vi.fn<() => Promise<void>>().mockRejectedValue(new Error('denied')));
    renderWithProviders(<ApiKeySecretDialog secret={SECRET} onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Kopiraj' }));
    // No crash, and the key is still selectable by hand.
    expect(screen.getByText(SECRET)).toBeInTheDocument();
  });

  it('closes only on the explicit acknowledgement', async () => {
    const onClose = vi.fn();
    renderWithProviders(<ApiKeySecretDialog secret={SECRET} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sačuvao sam ključ' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
