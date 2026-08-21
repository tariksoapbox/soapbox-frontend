# soapbox-frontend

Next.js + MUI web app for the Soapbox scoring app. It talks to
[**soapbox-backend**](https://github.com/tariksoapbox/soapbox-backend), which owns the data and the scoring rules
([`docs/SCORING.md`](https://github.com/tariksoapbox/soapbox-backend/blob/main/docs/SCORING.md)).

The two apps are separate repositories and neither imports from the other; the only thing
between them is HTTP.

## Tech stack

- **Runtime:** Node 24.13.0 (`.nvmrc` / `.node-version`), **npm** (a `package-lock.json` is committed — do not mix package managers)
- **Framework:** Next.js 16 (App Router, Turbopack) + React 19, TypeScript strict
- **UI:** MUI 9 + the App Router cache adapter · **Poppins** via `next/font`
- **Data:** TanStack Query · forms with react-hook-form + Zod 4
- **Language:** Bosnian only — no i18n framework, all copy in `src/content/*`
- **Tests:** Vitest + Testing Library, **100% lines** on the unit surface

## Getting started

The backend must be running first. Clone it as a sibling folder:

```bash
git clone https://github.com/tariksoapbox/soapbox-backend.git
cd soapbox-backend && npm install && cp .env.example .env && npm run dev   # :4000
```

Then, in a second terminal:

```bash
npm install
cp .env.example .env.local
npm run dev                       # http://localhost:3000
```

Sign in with `admin` / `Soapbox2026#6`, then create the judges and teams in the app — that admin
is the only row the backend seeds.

## Why the API is proxied

The browser only ever talks to the frontend's own origin at `/api/*`; Next rewrites that to the
backend. That keeps the session cookie **first-party** — a browser calling `onrender.com` from a
`vercel.app` page runs into Safari's and Firefox's third-party-cookie blocking, and a judge would
be silently signed out mid-race. It also leaves the backend with one CORS origin to allow instead
of one per preview deployment.

---

## Deploy

Both apps live in one repository, and `render.yaml` at the root is a Render Blueprint defining
**both** services. You have two sensible choices:

|            | Frontend on **Vercel** (recommended)                               | Frontend on **Render**                            |
| ---------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| Cold start | none — a Vercel deployment never sleeps                            | free instance sleeps after ~15 min, ~30 s to wake |
| Dashboards | two                                                                | one                                               |
| Setup      | delete `soapbox-web` from `render.yaml`, import the repo on Vercel | deploy the Blueprint as-is                        |
| Wiring     | paste the Render URL into Vercel's `BACKEND_ORIGIN`                | Render wires it automatically (`fromService`)     |

**Either works.** The recommendation is only about the free tier: with both services on Render,
a judge who opens the app after a quiet spell waits for the frontend to wake _and then_ the API.
Vercel removes half of that for free. If you would rather have one vendor and one dashboard,
Render is a perfectly good answer — put at least `soapbox-api` on a paid instance so it never
sleeps during an event.

Whichever you pick, the frontend must run as a **server** — a Node Web Service on Render, or a
normal Vercel deployment. It cannot be a static site, because it proxies `/api/*` to the backend
and a rewrite needs something running to perform it.

## Screens

| Route         | Who           | What                                                                  |
| ------------- | ------------- | --------------------------------------------------------------------- |
| `/prijava`    | anyone        | Sign in. There is no sign-up — an admin creates every account.        |
| `/sudija`     | judge         | The ballot: every team, both criteria, 1–10, one submission each.     |
| `/rang-lista` | any signed-in | The live board — three leaderboards plus the combined one.            |
| `/admin`      | admin         | Console: board · teams & run times · the judge × team matrix · users. |
| `/`           | —             | A switchboard: sends you to whichever of the above your role can use. |

## The API is proxied, not called cross-site

`next.config.ts` rewrites `/api/:path*` to `BACKEND_ORIGIN`, so the browser only ever talks to
this app's own origin. That keeps the session cookie **first-party** — a browser calling
`onrender.com` from a `vercel.app` page hits Safari's and Firefox's third-party-cookie blocking,
and a judge would be silently signed out mid-event. It also means the backend has exactly one
CORS origin to allow instead of one per preview deployment.

So there are two env vars, and they mean different things:

| Var                   | Read by                                 | Value                                                          |
| --------------------- | --------------------------------------- | -------------------------------------------------------------- |
| `BACKEND_ORIGIN`      | the Next.js **server**, for the rewrite | `http://localhost:4000` · `https://<service>.onrender.com`     |
| `NEXT_PUBLIC_API_URL` | the **browser**                         | `/api` — leave it alone unless you know why you're changing it |

## Live updates

The board and the judge's ballot poll on an interval (`LIVE_REFETCH_MS`, 3 s, in
`src/lib/queries/keys.ts`). Polling rather than a socket: it survives the proxy hop, a
free-tier instance waking up and a phone on flaky 4G at a race track, and a failed refetch just
tries again three seconds later. `placeholderData` keeps the previous board on screen across
polls so rows never blink out from under someone reading them.

## Scripts

| Script                                  | Purpose                                    |
| --------------------------------------- | ------------------------------------------ |
| `npm run dev` / `build` / `start`       | Next dev / production build / serve        |
| `npm run typecheck` / `lint` / `format` | `tsc --noEmit` / ESLint / Prettier         |
| `npm test` / `test:coverage`            | Vitest (the second enforces the 100% gate) |

## Structure

- `src/app/` — App Router. Each page is `AuthGuard` + `PageShell` + one container component.
- `src/components/` — UI, grouped by area (`judge/`, `standings/`, `admin/`) with the shared
  primitives at the top level.
- `src/lib/api/` — one file per API area, all through the single `apiFetch` wrapper.
- `src/lib/queries/` — TanStack Query hooks; `keys.ts` holds every cache key and the poll interval.
- `src/content/` — every user-facing string, typed `as const`.
- `src/schemas/` — the API contract (`contracts.ts`) and the form schemas (`forms.ts`).
- `src/theme.ts` — the palette and type scale. See **`STYLING_GUIDE.md`**.

## Deployment

This app must run as a **server**, not a static export — it proxies `/api/*` to the backend and
a rewrite needs something running to perform it. Two supported hosts:

**Vercel.** Set the **Root Directory** to `soapbox-frontend`, then one environment variable:

```
BACKEND_ORIGIN = https://<your-render-service>.onrender.com
```

**Render.** The `soapbox-web` service in the root `render.yaml` is a Node Web Service running
`next start`; Render supplies `PORT`, and `BACKEND_ORIGIN` is wired to the API service
automatically. `resolveBackendOrigin` adds the `https://` that Render's `fromService` host does
not include.

`NEXT_PUBLIC_API_URL` can be left unset either way — it defaults to `/api`.

### Which host?

|            | **Vercel** (recommended)                | **Render**                                        |
| ---------- | --------------------------------------- | ------------------------------------------------- |
| Cold start | none — a Vercel deployment never sleeps | free instance sleeps after ~15 min, ~30 s to wake |
| Dashboards | two                                     | one                                               |
| Setup      | import the repo, set `BACKEND_ORIGIN`   | deploy `render.yaml` as a Blueprint               |

The recommendation is only about the free tier: with both apps on Render, a judge opening the app
after a quiet spell waits for this service to wake **and then** the API. Vercel removes half of
that for free. If you would rather have one vendor, Render is a fine answer — put at least the
API on a paid instance so it never sleeps during an event.

Whichever you pick, deploy the API first: see [**soapbox-backend**](https://github.com/tariksoapbox/soapbox-backend).
