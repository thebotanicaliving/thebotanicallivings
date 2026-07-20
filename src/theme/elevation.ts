import { shadows } from './shadows';

export const elevation = {
  ground: shadows.none,
  low: shadows.sm,
  medium: shadows.md,
  high: shadows.lg,
} as const;
