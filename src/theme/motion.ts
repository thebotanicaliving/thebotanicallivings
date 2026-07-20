export const motion = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    medium: '350ms',
    slow: '500ms',
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
  transitions: {
    default: 'all 250ms ease-in-out',
    slow: 'all 500ms ease-in-out',
    fast: 'all 150ms ease-in-out',
  }
} as const;
