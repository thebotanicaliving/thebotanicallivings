import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { motion } from './motion';
import { layout } from './layout';
import { breakpoints } from './breakpoints';
import { borders } from './borders';
import { opacity } from './opacity';
import { elevation } from './elevation';
import { shadows } from './shadows';
import { zIndex } from './zIndex';

export {
  colors,
  typography,
  spacing,
  radius,
  motion,
  layout,
  breakpoints,
  borders,
  opacity,
  elevation,
  shadows,
  zIndex,
};

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  motion,
  layout,
  breakpoints,
  borders,
  opacity,
  elevation,
  shadows,
  zIndex,
} as const;
