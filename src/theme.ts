'use client';

import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

/**
 * Soapbox theme — the race palette: deep navy, red, white. Poppins throughout
 * (loaded in `app/layout.tsx`, referenced here as a CSS variable).
 *
 * Every token here is checked against WCAG 2.1 AA on the surface it is used on;
 * `STYLING_GUIDE.md` carries the ratios. Build UI from these tokens — to change
 * the look, change the theme, not a component.
 */

/** Colours with no MUI palette slot. */
interface BrandPalette {
  /** One step above `background.paper`: table headers, selected rows, chips. */
  elevated: string;
  /** Row hover / the tint on a team's own card. */
  rowHover: string;
  /**
   * Input and outlined-control hairline. 3.1:1 on `background.paper` and 3.5:1
   * on `background.default` — WCAG 1.4.11 for a control boundary.
   */
  fieldBorder: string;
  /**
   * Red as TEXT on a dark surface. `primary.main` is the fill colour (white on
   * it is 5.1:1) but only 3.5:1 as text on navy, so links, outlined buttons and
   * red labels take this lighter tint (5.8:1) instead.
   */
  redText: string;
  /** Podium accents. Decorative — every medal sits next to its own number. */
  gold: string;
  silver: string;
  bronze: string;
  /** The scoreboard's "not submitted yet" cell. */
  pending: string;
  /** Public scoreboard rows. Held as tokens so the light variant is a palette
   *  swap rather than a second set of components. */
  boardRowBg: string;
  boardRowBorder: string;
  /** First, second and third — by medal, in both variants. */
  podium: [PodiumTone, PodiumTone, PodiumTone];
}

/** One place on the podium, everywhere it is drawn. */
export interface PodiumTone {
  /** The place badge's fill. Bright in both variants — it is its own surface. */
  fill: string;
  /** Ink on that fill. Navy on every medal: 8.6:1 at worst. */
  ink: string;
  /** The medal as text — the row's total, and its edge accent. Needs to read
   *  on the row beneath it, which is why the two variants differ here. */
  text: string;
  /** The row's tint. */
  wash: string;
  /** The row's border, and the badge's. */
  edge: string;
}

declare module '@mui/material/styles' {
  interface Palette {
    brand: BrandPalette;
  }
  interface PaletteOptions {
    brand?: BrandPalette;
  }
  interface TypographyVariants {
    /** Machine values: totals, run times, scores — figures that get compared. */
    numeric: React.CSSProperties;
    /** The single big number on a scoreboard cell or a podium badge. */
    display: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    numeric?: React.CSSProperties;
    display?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    numeric: true;
    display: true;
  }
}

const FONT = 'var(--font-poppins), system-ui, -apple-system, sans-serif';

/**
 * The public board runs on Futura for Red Bull, which the console does not: the
 * licence is for the event's own screens, and Poppins is the better face for a
 * dense table of inputs anyway. Both stacks fall back to Poppins so a board
 * still renders correctly if the font file is slow or blocked.
 */
const BOARD_FONT = `var(--font-rb-book), ${FONT}`;

/**
 * Futura Condensed Bold, for the parts of a row that are read first — the
 * place, the team, the total. Condensed buys roughly a fifth more characters
 * per line, which is what lets the team names run as large as they do.
 */
export const boardDisplayFont = `var(--font-rb-cond), var(--font-rb-book), ${FONT}`;

const NAVY = '#0B1436';
const NAVY_PAPER = '#121F45';
const NAVY_ELEVATED = '#17244F';
const RED = '#DB0A40';
const RED_TEXT = '#FF5277';
const WHITE = '#FFFFFF';

/**
 * Everything the app theme is made of, minus the palette-as-CSS-variables
 * switch. The board builds on these same options with a different palette; see
 * `darkBoardTheme` for why it cannot simply be handed the built theme.
 */
const baseOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    // Red is the action colour. White on it is 5.1:1 — AA for all text.
    primary: { main: RED, light: RED_TEXT, dark: '#A80730', contrastText: WHITE },
    // White is the second brand colour, used for neutral/secondary actions.
    secondary: { main: WHITE, light: WHITE, dark: '#D6DCEF', contrastText: NAVY },
    background: { default: NAVY, paper: NAVY_PAPER },
    text: { primary: WHITE, secondary: '#A9B4D6' },
    divider: '#28356B',
    // Status colours all take dark text, and every status is spelled out in a
    // label as well — the brand IS red, so colour alone can never carry meaning.
    success: { main: '#4CC38A', contrastText: NAVY },
    warning: { main: '#FFC906', contrastText: NAVY },
    error: { main: '#FF6B6B', contrastText: NAVY },
    info: { main: '#8FB6F0', contrastText: NAVY },
    brand: {
      elevated: NAVY_ELEVATED,
      rowHover: '#1E2C5F',
      fieldBorder: '#5A6AA8',
      redText: RED_TEXT,
      gold: '#FFC906',
      silver: '#C0C6E0',
      bronze: '#E0A96D',
      pending: '#6E7BB0',
      boardRowBg: 'rgba(255,255,255,0.025)',
      boardRowBorder: 'rgba(255,255,255,0.07)',
      // The medals carry the top three. Red is the event's colour, not first
      // place's — and using it for the podium made second and third look like
      // they had won something too.
      podium: [
        {
          fill: '#FFC906',
          ink: NAVY,
          text: '#FFC906',
          wash: 'rgba(255,201,6,0.10)',
          edge: 'rgba(255,201,6,0.55)',
        },
        {
          fill: '#C0C6E0',
          ink: NAVY,
          text: '#C0C6E0',
          wash: 'rgba(192,198,224,0.09)',
          edge: 'rgba(192,198,224,0.45)',
        },
        {
          fill: '#E0A96D',
          ink: NAVY,
          text: '#E0A96D',
          wash: 'rgba(224,169,109,0.09)',
          edge: 'rgba(224,169,109,0.45)',
        },
      ],
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: FONT,
    h1: {
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      '@media (min-width:600px)': { fontSize: 34 },
    },
    h2: { fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: 20, fontWeight: 600 },
    h4: { fontSize: 17, fontWeight: 600 },
    h5: { fontSize: 15, fontWeight: 600 },
    h6: { fontSize: 14, fontWeight: 600 },
    body1: { fontSize: 15, lineHeight: 1.6 },
    body2: { fontSize: 13.5, lineHeight: 1.6 },
    caption: { fontSize: 12 },
    overline: { fontSize: 11, fontWeight: 600, letterSpacing: '.12em', lineHeight: 1.6 },
    button: { fontSize: 14, fontWeight: 600, textTransform: 'none' },
    // Tabular figures so a column of totals or run times lines up digit by digit.
    numeric: { fontVariantNumeric: 'tabular-nums', fontWeight: 600, letterSpacing: '-0.01em' },
    display: {
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 700,
      fontSize: 26,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Stop iOS Safari inflating type in landscape, which breaks the ballot grid.
        html: { WebkitTextSizeAdjust: '100%' },
        body: { backgroundColor: NAVY },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
          boxShadow: '0 18px 40px -28px rgba(0,0,0,.8)',
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 20, paddingBlock: 9 },
      },
      // `primary.main` is the FILL colour (white on it is 5.1:1). As *text* on
      // navy it is only 3.5:1, so an outlined or text button switches to the
      // lighter tint, which clears AA. Filled buttons keep the brand red.
      variants: [
        {
          props: { variant: 'outlined', color: 'primary' },
          style: ({ theme }) => ({
            color: theme.palette.brand.redText,
            borderColor: alpha(theme.palette.brand.redText, 0.5),
          }),
        },
        {
          props: { variant: 'text', color: 'primary' },
          style: ({ theme }) => ({ color: theme.palette.brand.redText }),
        },
      ],
    },
    MuiLink: {
      defaultProps: { underline: 'always' },
      styleOverrides: { root: ({ theme }) => ({ color: theme.palette.brand.redText }) },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: ({ theme }) => ({ borderColor: theme.palette.brand.fieldBorder }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        // Icon buttons sit inside flex rows and narrow table cells, where a
        // shrinking box turns the hover ripple into an ellipse.
        root: { borderRadius: '50%', flexShrink: 0 },
        // MUI derives an icon button's box from padding + glyph size, so it
        // lands a few pixels short of the control beside it and the row reads
        // as misaligned. Pinning both sizes to a square that matches the
        // controls they sit next to — 40px for a `size="small"` TextField or
        // Button, 32px for a table cell — is what puts every icon on the row's
        // line. Squareness also guarantees the hover ripple stays a circle.
        sizeMedium: { width: 40, height: 40 },
        sizeSmall: { width: 32, height: 32 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({ borderColor: theme.palette.divider }),
        head: ({ theme }) => ({
          backgroundColor: theme.palette.brand.elevated,
          color: theme.palette.text.secondary,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }),
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, fontSize: 12 } },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: 14 } },
    },
    MuiAlert: {
      defaultProps: { variant: 'outlined' },
    },
  },
};

/** The judging console. Keeps `cssVariables`, which the whole app is built on. */
export const theme = createTheme({ cssVariables: true, ...baseOptions });

/**
 * The light scoreboard.
 *
 * Same brand, inverted ground: navy becomes the ink instead of the surface, and
 * the red stays exactly where it was. It exists for screens and print where a
 * dark page is the wrong answer — a projector washing out, a photograph, a
 * printed result sheet.
 *
 * Only the palette changes. Every component reads tokens, so nothing else has
 * to know which variant it is rendering into.
 */
/**
 * The board themes deliberately do NOT set `cssVariables`.
 *
 * With it on, every `sx` colour compiles to `var(--mui-palette-…)` and those
 * variables are written once, at `:root`, by whichever provider is outermost —
 * here the app's dark theme in the root layout. A nested `ThemeProvider` then
 * changes the JS theme object but not the variables the CSS actually reads, so
 * the light palette resolves back to navy and the variant silently does
 * nothing. Without the flag these themes emit literal colours, which is what
 * lets a nested provider mean anything at all.
 *
 * They are built from `baseOptions` rather than from the built `theme` for the
 * same reason: spreading a built theme drags its `vars` and `colorSchemes`
 * along with it.
 */
const boardTypography = { ...baseOptions.typography, fontFamily: BOARD_FONT };

/** The default board: the app's dark palette, re-typeset in Futura. */
export const darkBoardTheme = createTheme({
  ...baseOptions,
  typography: boardTypography,
});

export const lightBoardTheme = createTheme({
  ...baseOptions,
  typography: boardTypography,
  palette: {
    mode: 'light',
    // White on this red is 5.1:1, and this red on white is the same — the one
    // colour that needed no adjustment.
    primary: { main: RED, light: '#B00734', dark: '#8E0429', contrastText: WHITE },
    secondary: { main: NAVY, light: '#2A3868', dark: '#05091F', contrastText: WHITE },
    background: { default: WHITE, paper: '#F6F8FC' },
    // Navy as ink: 18:1 on white. The secondary is a step darker than the
    // console's, which is free contrast on a board read across a room.
    text: { primary: NAVY, secondary: '#4C5679' },
    divider: '#DFE4F0',
    success: { main: '#137A4E', contrastText: WHITE },
    warning: { main: '#8A6100', contrastText: WHITE },
    error: { main: '#C0261E', contrastText: WHITE },
    info: { main: '#1F5FA8', contrastText: WHITE },
    brand: {
      elevated: '#EFF2F9',
      rowHover: '#E7ECF7',
      fieldBorder: '#8B95B8',
      redText: '#B00734',
      gold: '#9A7500',
      silver: '#6C7492',
      bronze: '#8A5A22',
      pending: '#767FA3',
      boardRowBg: WHITE,
      boardRowBorder: '#E6EAF2',
      // Same medals, same badges. Only the medal-as-text changes: gold at full
      // brightness is 1.5:1 on a white row, so the light variant reads the
      // total in a darkened version of the same colour.
      podium: [
        {
          fill: '#FFC906',
          ink: NAVY,
          text: '#8A6A00',
          wash: 'rgba(255,201,6,0.18)',
          edge: 'rgba(154,117,0,0.55)',
        },
        {
          fill: '#C0C6E0',
          ink: NAVY,
          text: '#5C6480',
          wash: 'rgba(120,132,170,0.14)',
          edge: 'rgba(92,100,128,0.45)',
        },
        {
          fill: '#E0A96D',
          ink: NAVY,
          text: '#8A5A22',
          wash: 'rgba(224,169,109,0.20)',
          edge: 'rgba(138,90,34,0.45)',
        },
      ],
    },
  },
});
