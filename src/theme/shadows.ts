export const shadows = {
  sm: '0 1px 2px 0 rgba(23, 53, 39, 0.05)',
  md: '0 4px 12px 0 rgba(23, 53, 39, 0.04)',
  lg: '0 8px 24px -4px rgba(23, 53, 39, 0.04)',
  none: 'none',
} as const;
export const elevation = shadows; // map elevation to shadows for compatibility
