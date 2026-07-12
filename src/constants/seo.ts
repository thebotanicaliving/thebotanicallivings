export const SeoConfig = {
  title: 'Botanical Living & Stays | Premium Eco-Luxury Co-Living',
  description: 'Immerse yourself in nature-inspired, elegant spaces designed for students, working professionals, and conscious guests. Co-living rooted in community and botanical design.',
  keywords: [
    'eco-luxury co-living',
    'premium hospitality',
    'botanical hotel',
    'student luxury living',
    'corporate retreats',
    'student accommodation',
    'luxury co-living'
  ],
  author: 'Botanical Living',
  openGraph: {
    title: 'Botanical Living & Stays | Premium Eco-Luxury Co-Living',
    description: 'Bespoke co-living & hospitality rooted in organic architecture and elegant nature-inspired design.',
    type: 'website',
    url: 'https://botanicalliving.com',
    siteName: 'Botanical Living & Stays',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Botanical Living & Stays'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Botanical Living & Stays | Eco-Luxury Hospitality',
    description: 'Bespoke eco-luxury co-living rooted in community and botanical architecture.',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&h=630&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
  }
} as const;
