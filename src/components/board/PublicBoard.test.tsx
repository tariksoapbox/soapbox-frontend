import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { PublicBoard } from './PublicBoard';
import { publicStandings, publicTeam } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';
import { startBoardScrollCycle } from '@/lib/boardScroll';

// The cycle itself is covered in boardScroll.test.ts; here the only question is
// whether the board arms it, disarms it again, and hands it the right numbers.
// Only the starter is stubbed — the settings-to-options mapping stays real, so
// these tests assert the pace the cycle would actually run at.
vi.mock('@/lib/boardScroll', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/boardScroll')>()),
  startBoardScrollCycle: vi.fn(() => vi.fn()),
}));

function setup(routes: Routes, props: React.ComponentProps<typeof PublicBoard> = {}) {
  const api = mockApi(routes);
  return { api, ...renderWithProviders(<PublicBoard {...props} />) };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('PublicBoard', () => {
  it('reads the board without any key — this page is public', async () => {
    const { api } = setup({
      'GET /public/standings': publicStandings([publicTeam()]),
    });
    expect(await screen.findByText('Leteći Bosanci')).toBeInTheDocument();
    // The keyed endpoint would need a credential the browser cannot keep secret.
    expect(api.calls.every((c) => c.path === '/public/standings')).toBe(true);
  });

  it('renders one row per team, in the order the API ranked them', async () => {
    setup({
      'GET /public/standings': publicStandings([
        publicTeam({ id: 't1', name: 'Prva', rank: 1 }),
        publicTeam({ id: 't2', name: 'Druga', rank: 2, placementSum: 7 }),
      ]),
    });
    await screen.findByText('Prva');
    const rows = screen.getAllByTestId('board-row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Prva');
    expect(rows[1]).toHaveTextContent('Druga');
  });

  it('carries no wordmark, status chip or timestamp — just the standings', async () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    await screen.findByText('Leteći Bosanci');
    expect(screen.queryByText('Soapbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Sistem bodovanja')).not.toBeInTheDocument();
    expect(screen.queryByText('Konačni rezultati')).not.toBeInTheDocument();
    // The bare clock read as a mystery number, so it is gone from the header.
    expect(screen.queryByText(/^\d{2}:\d{2}:\d{2}$/)).not.toBeInTheDocument();
    // And no per-row "Privremeno" either — the board shows standings, not
    // commentary on how settled each one is.
    expect(screen.queryByText(/Privremeno/)).not.toBeInTheDocument();
  });

  it('leads with the ranking itself', async () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    await screen.findByText('Leteći Bosanci');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rang lista');
  });

  it('renders the same rows in the white variant', async () => {
    // The variant is a palette swap, so the components must not change shape.
    // Which colours each palette supplies is asserted in theme.test.ts, where
    // the values are readable — a rendered element only reports the CSS
    // variable name, which is identical in both.
    mockApi({ 'GET /public/standings': publicStandings([publicTeam()]) });
    const { getAllByTestId, findByText } = renderWithProviders(<PublicBoard variant="light" />);
    await findByText('Leteći Bosanci');
    expect(getAllByTestId('board-row')).toHaveLength(1);
  });

  it('polls once a minute, not every few seconds', async () => {
    const { BOARD_REFETCH_MS } = await import('@/lib/queries/keys');
    // An audience screen is read, not operated; numbers twitching every three
    // seconds are harder to read than a board that settles.
    expect(BOARD_REFETCH_MS).toBe(60_000);
  });

  it('waits on a spinner alone, with no caption on screen', () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    const status = screen.getByRole('status');
    // Nothing visible but the spinner — the wording survives only as the
    // accessible name, for anyone who cannot see it turn.
    expect(status).toHaveTextContent('');
    expect(screen.getByLabelText('Rezultati se učitavaju…')).toBeInTheDocument();
  });

  it('says so when the race has not started', async () => {
    setup({ 'GET /public/standings': publicStandings([]) });
    expect(await screen.findByText('Utrka još nije počela.')).toBeInTheDocument();
  });

  it('reports a total failure to load', async () => {
    setup({ 'GET /public/standings': { status: 500, body: { error: 'nope' } } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Nema veze sa serverom');
  });

  it('wears the font class the page hands it', async () => {
    // The variables are declared by the server page, so if this class stops
    // reaching the board the whole thing silently falls back to Poppins.
    renderWithProviders(<PublicBoard fontClassName="rb-book rb-cond" />);
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading.closest('.rb-book.rb-cond')).not.toBeNull();
  });

  it('actually repaints on the light variant, down to the rendered pixels', async () => {
    // This asserts on computed colour rather than on the theme object, and it
    // has to: the variant once looked correct in the JS theme while the page
    // stayed navy, because MUI's `cssVariables` writes the palette to :root and
    // a nested provider never overrode it. Only the rendered value catches it.
    const rowColour = async (props: React.ComponentProps<typeof PublicBoard>) => {
      const { unmount } = setup(
        // Rank 4: a plain row, so this reads the ordinary surface token
        // rather than the podium's red wash.
        { 'GET /public/standings': publicStandings([publicTeam({ rank: 4 })]) },
        props,
      );
      const [first] = await screen.findAllByTestId('board-row');
      const row = first!.firstElementChild!;
      const bg = getComputedStyle(row).backgroundColor;
      unmount();
      return bg;
    };

    const dark = await rowColour({ variant: 'dark' });
    const lightVariant = await rowColour({ variant: 'light' });

    expect(lightVariant).not.toBe(dark);
    // A white row on a white page, not a translucent white on navy.
    expect(lightVariant).toBe('rgb(255, 255, 255)');
    expect(dark).toBe('rgba(255, 255, 255, 0.025)');
  });

  describe('unattended scrolling', () => {
    it('stays still unless the URL asked for it', async () => {
      setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
      await screen.findByText('Leteći Bosanci');
      expect(startBoardScrollCycle).not.toHaveBeenCalled();
    });

    it('starts the cycle when asked, and stops it when the page goes away', async () => {
      const stop = vi.fn();
      vi.mocked(startBoardScrollCycle).mockReturnValue(stop);

      const { unmount } = setup(
        { 'GET /public/standings': publicStandings([publicTeam()]) },
        { autoScroll: true },
      );
      await screen.findByText('Leteći Bosanci');
      expect(startBoardScrollCycle).toHaveBeenCalledTimes(1);
      // Default pace unless the URL said otherwise.
      expect(startBoardScrollCycle).toHaveBeenCalledWith(
        expect.objectContaining({ holdTopMs: 10_000, holdBottomMs: 5_000, downPxPerSec: 90 }),
      );

      // Without this the timers outlive the page and scroll whatever replaced it.
      unmount();
      expect(stop).toHaveBeenCalledTimes(1);
    });

    it('hands the cycle the pace the URL asked for', async () => {
      setup(
        { 'GET /public/standings': publicStandings([publicTeam()]) },
        {
          autoScroll: true,
          scrollSettings: { speed: 20, speedUp: 4, delayFromStart: 2, delayAtEnd: 15 },
        },
      );
      await screen.findByText('Leteći Bosanci');
      expect(startBoardScrollCycle).toHaveBeenCalledWith(
        expect.objectContaining({
          holdTopMs: 2_000,
          holdBottomMs: 15_000,
          downPxPerSec: 180,
          upPxPerSec: 36,
        }),
      );
    });

    it('renders the standings once, and does not loop, by default', async () => {
      setup({ 'GET /public/standings': publicStandings([publicTeam()]) }, { autoScroll: true });
      await screen.findByText('Leteći Bosanci');
      expect(screen.queryByTestId('board-loop-copy')).not.toBeInTheDocument();
      expect(vi.mocked(startBoardScrollCycle).mock.calls[0]?.[0]?.loopHeight).toBeUndefined();
    });

    it('renders a second copy for the endless mode, hidden from screen readers', async () => {
      setup(
        { 'GET /public/standings': publicStandings([publicTeam({ name: 'Prva' })]) },
        { autoScroll: true, loop: true },
      );
      // Two on the page, one in the accessibility tree: the standings are read
      // out once however many times they are drawn.
      expect(await screen.findAllByText('Prva')).toHaveLength(2);
      const second = screen.getByTestId('board-loop-copy');
      expect(second).toHaveAttribute('aria-hidden');

      // The repeated unit is the whole board, not just the rows — the logo and
      // the title come back round rather than scrolling away for good.
      expect(screen.getAllByAltText('Red Bull Soapbox Race')).toHaveLength(2);
      expect(within(second).getByText('Rang lista')).toBeInTheDocument();
      expect(within(second).getByAltText('Red Bull Soapbox Race')).toBeInTheDocument();
      expect(within(second).getByText('Prva')).toBeInTheDocument();

      // And the cycle is given a way to measure the wrap: the distance between
      // the two copies' tops, which is the only distance that hides the seam.
      const loopHeight = vi.mocked(startBoardScrollCycle).mock.calls[0]?.[0]?.loopHeight;
      expect(loopHeight).toBeTypeOf('function');

      const offsets: Array<[string, number]> = [
        ['board-copy', 200],
        ['board-loop-copy', 1_700],
      ];
      for (const [id, offsetTop] of offsets) {
        Object.defineProperty(screen.getByTestId(id), 'offsetTop', {
          value: offsetTop,
          configurable: true,
        });
      }
      expect(loopHeight?.()).toBe(1_500);
    });
  });

  it('states its own ink rather than inheriting the document colour', async () => {
    // This is the white-on-white screenshot as a test. CssBaseline sets body
    // colour from the console's :root variables, which a nested provider cannot
    // reach, so the board has to declare its own — on the root, where every row
    // inherits it.
    const inkOf = async (props: React.ComponentProps<typeof PublicBoard>) => {
      const { unmount } = setup(
        { 'GET /public/standings': publicStandings([publicTeam()]) },
        props,
      );
      const ink = getComputedStyle(await screen.findByTestId('board-root')).color;
      unmount();
      return ink;
    };

    expect(await inkOf({ variant: 'light' })).toBe('rgb(11, 20, 54)');
    expect(await inkOf({ variant: 'dark' })).toBe('rgb(255, 255, 255)');
  });

  it('sets the logo opposite the title, on one centred row', async () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    const logo = await screen.findByAltText('Red Bull Soapbox Race');
    const heading = screen.getByRole('heading', { level: 1 });
    const header = screen.getByTestId('board-header');

    // One row holding both, pushed to its two ends and centred against each
    // other — not stacked, which is what this replaced.
    expect(header).toContainElement(logo);
    expect(header).toContainElement(heading);
    const style = getComputedStyle(header);
    expect(style.display).toBe('flex');
    expect(style.justifyContent).toBe('space-between');
    expect(style.alignItems).toBe('center');
    // The mark on the right: last in the row, and it never shrinks.
    expect(header.lastElementChild).toBe(logo);
    expect(getComputedStyle(logo).flexShrink).toBe('0');
  });
});
