import { vi } from 'vitest';

/**
 * A stand-in for the API at the `fetch` boundary, so a container test exercises
 * the real query hook, the real client and the real component together — the
 * only layer stubbed is the network.
 *
 * Routes are matched by `METHOD /path`; the value is either a body (200), a
 * `{ status, body }` pair, or a **function** of the request body returning
 * either — which is how a test makes the fake API stateful, so a later GET can
 * reflect an earlier write. An unmatched call fails loudly rather than hanging.
 */
export interface Route {
  status?: number;
  body?: unknown;
}

export type RouteValue = unknown | Route;
export type Routes = Record<string, RouteValue | ((body: unknown) => RouteValue)>;

export function mockApi(routes: Routes) {
  const calls: { method: string; path: string; body: unknown }[] = [];
  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    const path = url.replace(/^\/api/, '');
    calls.push({
      method,
      path,
      body: typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined,
    });

    const route = routes[`${method} ${path}`];
    const match =
      typeof route === 'function'
        ? (route as (body: unknown) => RouteValue)(
            typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined,
          )
        : route;
    if (match === undefined) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: `Nema rute za ${method} ${path}`, code: 'NOT_FOUND' }),
      } as unknown as Response);
    }

    const resolved: Route =
      typeof match === 'object' && match !== null && ('status' in match || 'body' in match)
        ? (match as Route)
        : { body: match };
    const status = resolved.status ?? 200;
    return Promise.resolve({
      ok: status < 400,
      status,
      json: () => Promise.resolve(resolved.body),
    } as unknown as Response);
  });

  vi.stubGlobal('fetch', fetchMock);
  return { calls, fetchMock };
}
