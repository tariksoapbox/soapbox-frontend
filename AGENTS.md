# This repository is one half of a pair

The API lives in a separate repository, [soapbox-backend](https://github.com/tariksoapbox/soapbox-backend), and neither imports from the
other — the only thing between them is HTTP. Never add a workspace, a shared `node_modules`, or a
package spanning both. `src/schemas/contracts.ts` mirrors the API's response shapes by hand; the
backend's copy is authoritative.

**npm only.** A `package-lock.json` is committed; do not introduce pnpm or yarn, and never run
one on top of another's `node_modules` — that produces `ERESOLVE` errors naming packages in
neither manifest. Install scripts are gated by npm 11: the packages that legitimately need one
are listed under `allowScripts` in `package.json`, so a clean clone installs without prompting.

# UI / styling — follow the styleguide

All UI must follow **`STYLING_GUIDE.md`** and build from the MUI theme (`src/theme.ts`):

- **Never hard-code** colours, spacing, radii or fonts — use theme tokens and `sx` with palette
  keys (`color="primary"`, `bgcolor: 'background.paper'`, `borderColor: 'divider'`, theme spacing
  units). To change the look, change the **theme**, not individual components.
- **Red is a fill colour, not a text colour.** `primary.main` under white is AA; as text on navy
  it is not. Red _labels_ use `brand.redText`. The theme already handles outlined/text buttons
  and links.
- **Reuse the primitives** (`RHFTextField`, `PasswordField`, `QueryState`, `ConfirmDialog`,
  `FormAlert`, `PageShell`, `Brand`, `AppHeader`). Don't re-style MUI per component.
- **No navigation in the header.** Each role switches screens with `Tabs` inside its own page
  (`JudgeConsole`, `AdminConsole`). Do not add nav links back to `AppHeader`.
- **Judges do not sign in.** There is no judge-facing screen and no role anywhere in the app —
  everyone who signs in is an administrator. Scores are entered by the admin, one criterion at a
  time, via `CriterionScoreDialog`.
- **Editing a user is safe; deleting one is not.** Scores reference the user's UUID, so an edit
  keeps their votes while a delete cascades them away. `UserEditDialog` sends only the fields
  that actually changed, and the password is omitted unless one was typed.
- **A consequence is shown when it becomes one.** The password warning in `UserEditDialog`
  appears only after something is typed into the field — never on open, where it would announce
  a change that has not happened.
- **Actions:** one primary (`variant="contained"`) per view; secondary as `outlined`/`text`.
- **Copy:** every user-facing string lives in `src/content/*`, typed `as const` — no inline
  strings. The app is Bosnian only (`<html lang="bs">`); when addressing the user directly the
  formal pronoun is capitalised: Vi, Vas, Vam, Vaš/Vaša/Vaše.
- **A11y:** target WCAG 2.1 AA. Colour is never the only carrier of meaning — the brand IS red,
  so every state also carries a word, an icon or an ARIA attribute. Touch targets on the ballot
  stay ≥ 44px.
- **No Red Bull logo, wordmark or bull in the console.** Its brand read is the palette plus the
  typographic wordmark in `src/components/Brand.tsx`. The one exception is the public board
  (`/uzivo`), which carries the event's own supplied logo above the standings — that artwork was
  provided for this race, and the board is the screen the public sees.

# Code organization

One concern per file; shells stay thin.

- **Pages** (`src/app/**`) hold a guard, a title and a component — nothing else. Every page is
  `AuthGuard` + `PageShell` + one container component.
- **Data wiring lives in hooks** under `src/lib/queries/*` (query keys and cache invalidation);
  user-facing feedback stays in the view.
- **API clients** live under `src/lib/api/<area>.ts` — one file per area, all going through the
  single `apiFetch` wrapper in `src/lib/api.ts`.
- **Pure helpers go to `src/lib/`** and get direct unit tests.
- **New feature = new file(s)** imported by the shell — never grown inline into an existing
  component. Split when a file gains a second reason to change, not at a line count.

# The API is proxied, not called cross-site

The browser only ever talks to `/api/*` on this app's own origin; `next.config.ts` rewrites that
to the backend. That is what keeps the session cookie first-party. **Do not** point
`NEXT_PUBLIC_API_URL` at the backend's own domain unless you also understand what Safari's and
Firefox's third-party-cookie blocking will do to a judge mid-event.

# Testing workflow

The 100% line gate is the standard — but don't satisfy it turn by turn. Author fast, gate once.

- **While implementing:** run only the tests for what you changed — `npm test -- <path>`
  (npm needs the `--` before a positional argument).
- **Coverage gate:** run `npm run test:coverage` ONCE at the end, not after every file.
- **Build:** run `npm run build` when you touched a page under `src/app`, `next.config`, or build
  config. Component- and lib-only changes are covered by the unit tests.
- Container components are tested against a **stubbed `fetch`** (`src/lib/queries/test-server.ts`),
  so a single test exercises the component, its query hook and the API client together. Prefer
  that over mocking the hook — mocking the hook tests the mock.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
