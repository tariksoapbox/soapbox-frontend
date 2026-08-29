# Styling guide

The single source of truth for the app's visual language. The MUI theme
(`src/theme.ts`) encodes these tokens — **build UI from the theme, not from hard-coded
values.** To change the look, change the theme.

Direction: **race night.** Deep navy ground, one red for action, white for everything you read.
No logo, no bull, no imported mark of any kind — the brand read comes entirely from the palette
and the wordmark in `src/components/Brand.tsx`.

## Palette

Ratios are measured against the surface the token is actually used on. Everything that carries
text clears **WCAG 2.1 AA (4.5:1)**; everything that draws a control boundary clears **3:1**
(WCAG 1.4.11).

| Token                              | Hex                               | Use                                                                     | Contrast                                        |
| ---------------------------------- | --------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| `background.default`               | `#0B1436`                         | Page ground                                                             | —                                               |
| `background.paper`                 | `#121F45`                         | Cards, tables, dialogs, the header                                      | —                                               |
| `brand.elevated`                   | `#17244F`                         | Table headers, chips, badge fills, score tiles                          | —                                               |
| `brand.rowHover`                   | `#1E2C5F`                         | Row hover                                                               | —                                               |
| `primary.main`                     | `#DB0A40`                         | **Fill** colour: contained buttons, the live dot, the active-tab rule   | white on it = **5.1:1**                         |
| `primary.light` / `brand.redText`  | `#FF5277`                         | **Text** colour: links, outlined/text buttons, destructive icon buttons | **5.1:1** on paper, 5.8:1 on the page ground    |
| `primary.dark`                     | `#A80730`                         | The login page's corner wash                                            | decorative                                      |
| `secondary.main`                   | `#FFFFFF`                         | Neutral actions — outlined buttons, unselected score keys               | **16:1** on paper                               |
| `text.primary`                     | `#FFFFFF`                         | Body and headings                                                       | 16:1 on paper                                   |
| `text.secondary`                   | `#A9B4D6`                         | Labels, meta, captions                                                  | **6.7:1** on paper                              |
| `divider`                          | `#28356B`                         | Hairlines between rows and sections                                     | decorative                                      |
| `brand.fieldBorder`                | `#5A6AA8`                         | Input and outlined-control boundary                                     | **3.1:1** on paper, 3.5:1 on the ground         |
| `success.main`                     | `#4CC38A`                         | A cast score, an active account, a finished event                       | **6.8:1**                                       |
| `warning.main`                     | `#FFC906`                         | "No judges yet"                                                         | **9.7:1**                                       |
| `error.main`                       | `#FF6B6B`                         | Errors                                                                  | **5.4:1**                                       |
| `info.main`                        | `#8FB6F0`                         | Advisory notices                                                        | —                                               |
| `brand.gold` / `silver` / `bronze` | `#FFC906` / `#C0C6E0` / `#E0A96D` | Podium accents on `PlaceBadge`                                          | decorative — the place number is always printed |
| `brand.pending`                    | `#6E7BB0`                         | "Čeka", "Bez vremena", the `x / y sudija` fraction                      | —                                               |

### The one rule that is easy to get wrong

**Red is a fill colour, not a text colour.** `#DB0A40` is 5.1:1 under white (so a contained
button is fine) but only **3.5:1 as text on navy** — under AA. Every red _label_ therefore uses
`brand.redText` instead. The theme already does this for `Button variant="outlined"|"text"` and
for `Link`; if you need red text anywhere else, reach for `brand.redText`, never `primary.main`.

### Colour is never the only carrier

The brand _is_ red, so a red thing cannot mean "danger" on its own. Every state is spelled out:

- Status chips carry a word — `Aktivan` / `Deaktiviran`, `Poslano`, `Privremeno`, `Čeka`.
- `PlaceBadge` prints the place number inside the medal ring.
- The current nav item gets weight, an underline **and** `aria-current="page"`.
- The selected score key gets `aria-checked` as well as the filled style.

## Typography

**Poppins** throughout, loaded with `next/font` in `app/layout.tsx` (subsets `latin` +
`latin-ext` for š, č, ć, đ, ž) and referenced from the theme as `--font-poppins`.

| Variant           | Size               | Weight | Use                                               |
| ----------------- | ------------------ | ------ | ------------------------------------------------- |
| `h1`              | 28 → 34px at 600px | 700    | Page title — one per screen, owned by `PageShell` |
| `h2`              | 24px               | 700    |                                                   |
| `h3`              | 20px               | 600    | Section and card headings                         |
| `h4` / `h5`       | 17 / 15px          | 600    |                                                   |
| `h6`              | 14px               | 600    | Criterion labels on the ballot                    |
| `body1` / `body2` | 15 / 13.5px        | 400    | Reading sizes                                     |
| `caption`         | 12px               | 400    | Meta, timestamps                                  |
| `overline`        | 11px, `.12em`      | 600    | Uppercase column and field labels                 |
| `button`          | 14px               | 600    | `textTransform: none`                             |

Two variants sit outside the reading scale because they size **machine values**, not prose —
both use `font-variant-numeric: tabular-nums` so a column of totals or run times lines up digit
by digit:

| Variant   | Use                                                              |
| --------- | ---------------------------------------------------------------- |
| `numeric` | Totals, places, start numbers, run times, individual scores      |
| `display` | The one big figure in a cell: the placement sum, a podium number |

> **Never set `fontSize` in a component.** If a screen needs a size that is not here, add a named
> variant to `src/theme.ts` and this table together. The `fontSize` values that remain in
> components size a _glyph inside a box_ (a score key, a badge) — that is box sizing, not type.

## Shape, spacing, elevation

- **Radius:** `shape.borderRadius = 14`. **Buttons are pills** (`borderRadius: 999`).
- **Spacing:** the MUI 8px base. `Stack spacing={2}` between form fields, `spacing={2–3}`
  between sections, page padding `py: 3–4`.
- **Elevation:** no MUI elevation levels. Cards take a `divider` hairline plus one soft shadow
  (`0 18px 40px -28px rgba(0,0,0,.8)`), applied by the theme so every surface inherits it.
  Buttons are `disableElevation`; `Paper` sets `backgroundImage: none` (otherwise MUI's dark
  mode tints it and the navy drifts).

## Component conventions

- **Buttons:** one `variant="contained"` primary per view; secondary actions are
  `outlined`/`text` in `color="secondary"` (white) or `primary` (which resolves to the readable
  red tint).
- **Inputs:** always `TextField`, always labelled, validation in `helperText` via
  `RHFTextField`. Never a raw `<input>` — it would bypass the theme.
- **Icon buttons are square, and sized to what they sit beside.** The theme pins `MuiIconButton`
  to `borderRadius: 50%` + `flexShrink: 0`, and fixes the box: **40px** (`sizeMedium`, matching a
  `size="small"` TextField or Button) and **32px** (`sizeSmall`, for table cells). MUI otherwise
  derives the box from padding + glyph size, which lands a few pixels short of the control beside
  it and reads as a misaligned row. Never override the radius or the box.
- **Rows of mixed controls set `alignItems` explicitly.** A `Stack direction="row"` defaults to
  `stretch`, which leaves a button and two icons on three different baselines. Use `center` when
  every control is single-line (a table's action cell), and `flex-start` when a field carries
  helper text — centring would then drop the icon below the input it belongs to.
- **Password inputs use `PasswordField`**, never a bare `type="password"`: masked by default with
  a reveal toggle. These are typed on a phone in public, and a judge's password can never be
  reset, so checking what was typed has to be possible on both sides.
- **Destructive actions** go through `ConfirmDialog`, and the description says what else gets
  destroyed (deleting a team or a judge cascades to their scores).
- **Every list view** goes through `QueryState`, so loading, failure and empty look the same
  everywhere and the loading state is announced (`role="status"`, `aria-live="polite"`).
- **Page chrome** comes from `PageShell` — it owns the header, the container width and the one
  `h1` on the screen.

## Navigation

There is **no navigation in the header** — it carries the wordmark, who you are, and sign-out.
Each role's screens are MUI `Tabs` at the top of its own page (`JudgeConsole`, `AdminConsole`),
so the switch sits next to the content it switches and the app has one navigation idea rather
than two. `/rang-lista` is unlinked on purpose: it is the bare board for a projector.

## Entering scores

Nobody scores on a phone: judges mark on paper and an admin transcribes on a laptop. There are
two jobs, so two inputs:

- **`GradeField`** — a typed number, in every grid cell. This is the _correction_ path: a card was
  misread, fix that one number. It uses `inputMode="numeric"` rather than `type="number"`, so
  there are no spinners and the scroll wheel cannot silently change a mark being hovered over. It
  commits on blur and on Enter, never per keystroke — otherwise typing `10` would write a `1`
  first.
- **`ScorePicker`** — the 1–10 scale, ten buttons, inside the bulk dialog. This is the _entry_
  path: a whole column set deliberately, where seeing the range beats typing. Picking the selected
  mark again clears it.

An empty field means **"not written down yet"** and is stored as a blank, never a zero — a missing
card must not drag a total down.

## Tables that outgrow the screen

The score grid has a column per judge and must survive a panel growing past five. The team column
is **pinned** (`position: sticky; left: 0`) with an opaque background, so judges scroll
horizontally underneath it without the row losing its label, and row actions are icon-only. Any
table that can grow a column per record should do the same.

**A person's name in a header is a name, not a label.** The theme sets `MuiTableCell.head` to
uppercase with `.1em` tracking, which is right for `EKIPA` or `UKUPNO` and wrong for
"Elvedina Muzaferija" — set that way it is far wider than its column and spills into the
neighbouring header, so two judges' surnames end up touching. Columns headed by a record's name
opt out: `textTransform: 'none'`, `letterSpacing: 0`, 12px, wrapping, with
`overflowWrap: 'anywhere'` as the backstop for a name longer than any column could hold.

## Iterating

Change a token in `src/theme.ts` and update this table in the same commit, so the two cannot
drift. If a new colour is introduced, measure it against the surface it sits on before it ships.
