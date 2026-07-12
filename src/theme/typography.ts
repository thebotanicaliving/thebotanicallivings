export const typography = {
  fonts: {
    heading: 'Cormorant Garamond, serif',
    body: 'Inter, sans-serif',
    button: 'Manrope, sans-serif',
  },
  sizes: {
    mobile: {
      xs: '14px',
      sm: '15px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      h3: '24px',
      h2: '32px',
      h1: '40px',
    },
    tablet: {
      xs: '14px',
      sm: '16px',
      base: '18px',
      lg: '20px',
      xl: '22px',
      h3: '28px',
      h2: '36px',
      h1: '48px',
    },
    laptop: {
      xs: '14px',
      sm: '16px',
      base: '18px',
      lg: '22px',
      xl: '26px',
      h3: '32px',
      h2: '44px',
      h1: '56px',
    },
    desktop: {
      xs: '14px',
      sm: '16px',
      base: '18px',
      lg: '24px',
      xl: '28px',
      h3: '36px',
      h2: '48px',
      h1: '64px',
    }
  },
  lineHeights: {
    tight: 1.15,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0em',
    wide: '0.02em',
    wider: '0.05em',
    widest: '0.1em',
  }
} as const;
