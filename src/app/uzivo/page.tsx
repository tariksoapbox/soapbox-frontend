import type { Metadata } from 'next';
import { PublicBoard } from '@/components/board/PublicBoard';
import { boardVariantFromUrl } from '@/lib/boardVariant';
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
  return <PublicBoard variant={boardVariantFromUrl(params.tema)} />;
}
