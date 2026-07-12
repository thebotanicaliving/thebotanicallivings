export const spacing = {
  tokens: {
    4: '4px',
    8: '8px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    48: '48px',
    64: '64px',
    80: '80px',
    96: '96px',
    128: '128px',
  },
  padding: {
    container: {
      mobile: '20px',
      tablet: '32px',
      desktop: '48px',
    },
    section: {
      sameBg: '80px',
      transitionBg: '120px',
    },
    card: '24px',
    button: {
      py: '12px',
      px: '24px',
    },
    input: {
      py: '12px',
      px: '16px',
    }
  },
  layout: {
    maxWidth: '1300px',
  }
} as const;
