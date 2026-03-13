import {Platform} from 'react-native';

/**
 * Colors derived from The Atlantic brand guidelines.
 * Uses the light-mode palette; dark mode is out of scope for this exercise.
 */
export const colors = {
  /** Brand red — primary interactive/accent color */
  accent: '#E7131A',
  /** Near-black used for primary text */
  text: '#21272C',
  /** Secondary text (bylines, captions, metadata) */
  textSecondary: '#5E6A74',
  /** Tertiary text (timestamps, placeholders) */
  textTertiary: '#D3DCE6',
  /** Primary background */
  background: '#FFFFFF',
  /** Subtle surface (cards, header backgrounds) */
  surface: '#F5F5F5',
  /** Dividers and borders */
  border: '#D3DCE6',
  /** Error states */
  error: '#E7131A',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/**
 * Typography scale modeled after The Atlantic's text class hierarchy.
 *
 * The production app uses proprietary typefaces (Atlantic, Garamond Pro,
 * Graphik, Logic Monospace). This simplified version uses platform-native
 * serif/sans-serif families so the exercise runs without bundling custom fonts.
 *
 * Serif (Georgia / Noto Serif) → stands in for Garamond Pro (headlines, deks)
 * System default → stands in for Graphik (body, UI text)
 * Monospace (Courier / monospace) → stands in for Logic Monospace (bylines)
 */
const serifFamily = Platform.select({
  ios: 'Georgia',
  default: 'serif',
});

const monoFamily = Platform.select({
  ios: 'Courier',
  default: 'monospace',
});

export const typography = {
  /** Large article headlines — serif, similar to Display H3 (33px) */
  headline: {
    fontFamily: serifFamily,
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 34,
    color: colors.text,
  },
  /** List item titles — serif, similar to Display Text (20px) */
  title: {
    fontFamily: serifFamily,
    fontSize: 20,
    fontWeight: '400' as const,
    lineHeight: 28,
    color: colors.text,
  },
  /** Body text — system sans-serif, similar to Utility Text (16px) */
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: colors.text,
  },
  /** Author bylines — monospace uppercase, similar to Author Byline (13px) */
  byline: {
    fontFamily: monoFamily,
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 13,
    letterSpacing: 0.25,
    textTransform: 'uppercase' as const,
    color: colors.textSecondary,
  },
  /** Small metadata (dates, word counts) — system sans, similar to Utility Subtitle (12px) */
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.25,
    color: colors.textSecondary,
  },
  /** Article deks/subtitles — serif, similar to Display Text (20px) scaled down */
  dek: {
    fontFamily: serifFamily,
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  /** Dates in feed — accent red, similar to Utility Subtitle */
  date: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.25,
    color: colors.accent,
  },
};
