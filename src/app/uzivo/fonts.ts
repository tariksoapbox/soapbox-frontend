import localFont from 'next/font/local';

/**
 * Futura for Red Bull, licensed to the event and used on the public scoreboard
 * only — not in the judging console, which stays on Poppins.
 *
 * `next/font/local` may only be called from a server module, so the two
 * variables are declared here and handed to the board as a class name rather
 * than being set on the root layout. That keeps the files out of every other
 * page's payload: nothing but /uzivo asks the browser for them.
 *
 * Converted from the supplied TTFs to WOFF2 — 261KB to 76KB, which matters on
 * a venue screen sharing an event's uplink.
 */
const book = localFont({
  src: '../../fonts/FuturaForRedBull-Book.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-rb-book',
  // Futura's own metrics, so the swap from the fallback does not shift the row.
  adjustFontFallback: 'Arial',
});

const condensedBold = localFont({
  src: '../../fonts/FuturaForRedBull-CondBold.woff2',
  weight: '700',
  style: 'normal',
  display: 'swap',
  variable: '--font-rb-cond',
  adjustFontFallback: 'Arial',
});

/** Both variables, for the element that wraps the board. */
export const boardFontClassName = `${book.variable} ${condensedBold.variable}`;
