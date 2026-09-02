import type { Metadata } from 'next';
import { PublicBoard } from '@/components/board/PublicBoard';
import { boardFontClassName } from './fonts';
import { resolveBackendOrigin } from '@/lib/backendOrigin';
import { boardVariantFromUrl } from '@/lib/boardVariant';
import { autoScrollFromUrl, boardScrollSettingsFromUrl, loopFromUrl } from '@/lib/boardAutoScroll';
import { board } from '@/content/standings';
import { common } from '@/content/common';

/**
 * The public scoreboard. No sign-in: this is the screen at the venue and the
 * link handed to spectators, so it is the one page in the app without a guard.
 *
 * The variant is in the URL rather than a toggle, so a screen can be pointed at
 * one and left alone:
 *
 *   /uzivo                  dark  (default)
 *   /uzivo?tema=svijetla    white
 *   /uzivo?tema=tamna       dark, stated explicitly
 *
 * `?vrti` adds the unattended scroll cycle, so an operator can point one screen
 * at a self-scrolling board and another at a still one from the same app. The
 * two combine: /uzivo?tema=svijetla&vrti
 *
 * The cycle takes four numbers, all on a 1–20 scale and all clamped into it:
 *
 *   brzina=10        pace of the descent (1 crawls, 20 runs)
 *   brzinaGore=10    pace of the trip back up
 *   pauzaNaVrhu=10   seconds at the top before setting off
 *   pauzaNaDnu=5     seconds at the bottom before coming back
 *
 * Results arrive over a socket, so the board moves the moment an admin saves a
 * mark. The origin is read here, on the server, from the same BACKEND_ORIGIN
 * the /api rewrite uses — no second variable to set, and nothing to configure
 * on a venue screen.
 *
 * `?ukrug` replaces the there-and-back with an endless crawl: the standings run
 * on and start again underneath themselves, never turning around. It implies
 * `?vrti`, and pauzaNaDnu and brzinaGore have nothing to describe in that mode.
 */
export const metadata: Metadata = {
  title: `${board.title} — ${common.appName}`,
  description: 'Rang lista uživo.',
};

export default async function LiveBoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const loop = loopFromUrl(params.ukrug);
  return (
    <PublicBoard
      variant={boardVariantFromUrl(params.tema)}
      autoScroll={autoScrollFromUrl(params.vrti) || loop}
      loop={loop}
      scrollSettings={boardScrollSettingsFromUrl(params)}
      liveOrigin={resolveBackendOrigin(process.env.BACKEND_ORIGIN)}
      fontClassName={boardFontClassName}
    />
  );
}
