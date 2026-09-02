import type { Metadata } from 'next';
import { PublicBoard } from '@/components/board/PublicBoard';
import { board } from '@/content/standings';
import { common } from '@/content/common';

/**
 * The public scoreboard. No sign-in: this is the screen at the venue and the
 * link handed to spectators, so it is the one page in the app without a guard.
 */
export const metadata: Metadata = {
  title: `${board.title} — ${common.appName}`,
  description: 'Rang lista uživo.',
};

export default function LiveBoardPage() {
  return <PublicBoard />;
}
