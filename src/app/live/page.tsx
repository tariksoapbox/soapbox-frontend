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
 *   /live                dark  (default)
 *   /live?theme=light    white
 *   /live?theme=dark     dark, stated explicitly
 *
 * `?upAndDown` adds the unattended scroll cycle, so an operator can point one
 * screen at a self-scrolling board and another at a still one from the same
 * app. The two combine: /live?theme=light&upAndDown
 *
 * The cycle takes four numbers, all on a 1–20 scale and all clamped into it:
 *
 *   speedDown=10      pace going down the list (1 crawls, 50 runs)
 *   speedUp=10        pace coming back up; follows speedDown if omitted
 *   delayAtTop=10     seconds at the top before setting off
 *   delayAtBottom=5   seconds at the bottom before coming back
 *
 * Results arrive over a socket, so the board moves the moment an admin saves a
 * mark. The origin is read here, on the server, from the same BACKEND_ORIGIN
 * the /api rewrite uses — no second variable to set, and nothing to configure
 * on a venue screen.
 *
 * `?loop` replaces the there-and-back with an endless run: the standings carry
 * on and start again underneath themselves, never turning around. It implies
 * `?upAndDown`, and delayAtBottom and speedUp have nothing to describe there.
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
  const loop = loopFromUrl(params.loop);
  return (
    <PublicBoard
      variant={boardVariantFromUrl(params.theme)}
      autoScroll={autoScrollFromUrl(params.upAndDown) || loop}
      loop={loop}
      scrollSettings={boardScrollSettingsFromUrl(params)}
      liveOrigin={resolveBackendOrigin(process.env.BACKEND_ORIGIN)}
      fontClassName={boardFontClassName}
    />
  );
}
