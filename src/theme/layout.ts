import { spacing } from './spacing';
import { breakpoints } from './breakpoints';

export const layout = {
  maxWidth: spacing.layout.maxWidth,
  grid: {
    desktop: 12,
    laptop: 12,
    tablet: 8,
    mobile: 4,
  },
  breakpoints,
} as const;
