import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useRef } from 'react';
import { useRowChoreography } from './useRowChoreography';
import { publicTeam } from './fixtures';
import * as flip from '@/lib/flipRows';
import type { PublicTeam } from '@/schemas/contracts';

function Board({ teams }: { teams: PublicTeam[] | undefined }) {
  const root = useRef<HTMLDivElement>(null);
  useRowChoreography(root, teams);
  return (
    <div ref={root}>
      {teams?.map((team) => (
        <div key={team.id} data-team-id={team.id} />
      ))}
    </div>
  );
}

const team = (id: string) => publicTeam({ id, name: id });

let play: ReturnType<typeof vi.spyOn>;
let measure: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  play = vi.spyOn(flip, 'playRowMoves').mockReturnValue(0);
  measure = vi.spyOn(flip, 'measureRows');
  window.matchMedia = ((q: string) => ({ matches: false, media: q })) as typeof window.matchMedia;
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useRowChoreography', () => {
  it('does not animate the first board it is given', () => {
    // There is no previous order to travel from — the standings simply appear.
    render(<Board teams={[team('a'), team('b')]} />);
    expect(play).not.toHaveBeenCalled();
  });

  it('animates when the order changes', () => {
    const { rerender } = render(<Board teams={[team('a'), team('b')]} />);
    rerender(<Board teams={[team('b'), team('a')]} />);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('stays still when the same order arrives again', () => {
    // The board polls every minute and the socket pushes on every save. Most
    // updates change a number, not a position, and must not shuffle the page.
    const { rerender } = render(<Board teams={[team('a'), team('b')]} />);
    rerender(<Board teams={[team('a'), team('b')]} />);
    expect(play).not.toHaveBeenCalled();
  });

  it('animates when a team joins the board', () => {
    const { rerender } = render(<Board teams={[team('a')]} />);
    rerender(<Board teams={[team('a'), team('b')]} />);
    // The order string changed, so the rows that were already there can move.
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('passes the display motion preference through', () => {
    window.matchMedia = ((q: string) => ({ matches: true, media: q })) as typeof window.matchMedia;
    const { rerender } = render(<Board teams={[team('a'), team('b')]} />);
    rerender(<Board teams={[team('b'), team('a')]} />);
    expect(play).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      reducedMotion: true,
    });
  });

  it('survives a browser without matchMedia', () => {
    // @ts-expect-error — deliberately removing it.
    delete window.matchMedia;
    const { rerender } = render(<Board teams={[team('a'), team('b')]} />);
    expect(() => rerender(<Board teams={[team('b'), team('a')]} />)).not.toThrow();
  });

  it('handles a board with no data at all', () => {
    expect(() => render(<Board teams={undefined} />)).not.toThrow();
  });

  it('takes the positions again once the travel has finished', () => {
    // At the instant a move starts, a travelling row has just been pinned back
    // to where it began. Measuring only then would record the position it left,
    // and a second reorder — which a fast scorer produces — would animate from
    // a place the row is no longer in.
    vi.useFakeTimers();
    const { rerender } = render(<Board teams={[team('a'), team('b')]} />);
    rerender(<Board teams={[team('b'), team('a')]} />);

    const atMoveTime = measure.mock.calls.length;
    vi.advanceTimersByTime(flip.FLIP_MS + 200);
    expect(measure.mock.calls.length).toBeGreaterThan(atMoveTime);
  });

  it('does not re-measure a board that has gone away', () => {
    vi.useFakeTimers();
    const { rerender, unmount } = render(<Board teams={[team('a'), team('b')]} />);
    rerender(<Board teams={[team('b'), team('a')]} />);
    unmount();

    const afterUnmount = measure.mock.calls.length;
    vi.advanceTimersByTime(flip.FLIP_MS + 200);
    expect(measure.mock.calls.length).toBe(afterUnmount);
  });
});
