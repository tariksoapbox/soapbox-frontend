'use client';

import { createTheme, alpha } from '@mui/material/styles';

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

const NAVY = '#0B1436';
const NAVY_PAPER = '#121F45';
const NAVY_ELEVATED = '#17244F';
const RED = '#DB0A40';
const RED_TEXT = '#FF5277';
const WHITE = '#FFFFFF';

export const theme = createTheme({
  cssVariables: true,
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
});
