'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { queryKeys } from './keys';
import type { PublicStandings } from '@/schemas/contracts';

/** The event the API pushes. Must match the backend's `STANDINGS_EVENT`. */
export const STANDINGS_EVENT = 'standings';

/**
 * The live feed, straight from the API.
 *
 * Not through the `/api` rewrite, unlike every other call in this app: that
 * proxy exists to keep the session cookie first-party, and this connection
 * carries no cookie and needs no session — the board is public. Talking to the
 * API's own origin also avoids asking a Next rewrite to proxy a WebSocket
 * upgrade, which is one more thing between a venue screen and its results.
 *
 * The poll stays on underneath. If a network blocks WebSockets, or the API
 * restarts, the board falls back to a minute-old picture rather than a frozen
 * one — and the socket reconnects on its own when it can.
 */
export function useLiveStandings(origin: string | undefined): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!origin) return;

    const socket: Socket = io(origin, {
      // Polling first would work, but a scoreboard is exactly the case
      // WebSockets exist for; the fallback is still there if the upgrade fails.
      transports: ['websocket', 'polling'],
      withCredentials: false,
      reconnectionDelayMax: 10_000,
    });

    socket.on(STANDINGS_EVENT, (standings: PublicStandings) => {
      // Written into the same cache entry the poll fills, so the board has one
      // source of truth and the fetch and the push cannot disagree.
      queryClient.setQueryData(queryKeys.publicBoard, standings);
    });

    return () => {
      socket.off(STANDINGS_EVENT);
      socket.disconnect();
    };
  }, [origin, queryClient]);
}
