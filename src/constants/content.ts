import { Hotel } from './hotel';

export const Content = {
  hero: {
    title: "Premium Coliving Spaces in Kondapur, Hyderabad",
    subtitle: "Fully Furnished Premium Coliving Spaces Near Kondapur, Botanical Garden, Financial District, Gachibowli and HITEC City.",
    primaryCTA: "Book a Visit",
    secondaryCTA: "WhatsApp Now",
    thirdCTA: "Call Now",
  },
  
  whyBotanical: {
    title: "Why Botanical Living?",
    features: [
      {
        title: "Premium Furnished Rooms",
        description: "Elegant living spaces designed for the modern professional with premium finishes.",
        icon: "Home",
      },
      {
        title: "Botanical Café",
        description: "Our signature rooftop café offering great food and views for inspired moments.",
        icon: "Coffee",
      },
      {
        title: "Modern Dining Hall",
        description: "Spacious and hygienic dining areas serving homely, nutritious meals daily.",
        icon: "ChefHat",
      },
      {
        title: "Daily Housekeeping",
        description: "Professional cleaning services to maintain your sanctuary in pristine condition.",
        icon: "Brush",
      },
      {
        title: "Free Laundry & Ironing",
        description: "Hassle-free laundry services included in your stay for total convenience.",
        icon: "Waves",
      },
      {
        title: "Community Living",
        description: "Join a curated community of mindful professionals and build lasting connections.",
        icon: "Users",
      },
    ],
  },

  cafe: {
    title: Hotel.cafe.name,
    description: Hotel.cafe.description,
    highlights: Hotel.cafe.highlights,
    tagline: "Great Food. Great Views. Better Conversations.",
  },

  rooms: {
    title: "Luxury Suite Types",
    subtitle: "Choose from our curated sharing options designed for comfort and privacy.",
    sharingOptions: Hotel.accommodation.roomTypes.map(room => ({
      ...room,
      cta: "Book Visit",
      secondaryCta: "Learn More",
      priceLabel: room.id === 'single-sharing' ? `₹${room.basePrice.toLocaleString()} / month` : `₹${room.basePrice.toLocaleString()} / head`
    }))
  },

  faqs: [
    {
      question: "Is Botanical Living suitable for software professionals?",
      answer: "Absolutely. We are strategically located near HITEC City, Financial District, and Gachibowli. With high-speed WiFi, dedicated study tables, and a work-friendly café, we cater specifically to the needs of software professionals.",
    },
    {
      question: "Is food included?",
      answer: "Yes, we provide homely and nutritious meals. Our packages include 6 days of non-veg meals per week, ensuring a variety of healthy and satisfying options.",
    },
    {
      question: "How far is Financial District?",
      answer: `Financial District is approximately 4.5km away, which is about a 10-15 minute commute depending on traffic.`,
    },
    {
      question: "Is Single Sharing available?",
      answer: "Yes, we offer premium single sharing rooms for those who prefer maximum privacy and space.",
    },
    {
      question: "Is parking available?",
      answer: "Yes, we have dedicated parking space for our residents' vehicles.",
    },
    {
      question: "Is daily housekeeping included?",
      answer: "Yes, daily housekeeping is part of our standard service to ensure your living space remains clean and hygienic.",
    },
    {
      question: "Are visitors allowed?",
      answer: "Yes, visitors are allowed in common areas during designated hours. For stay-overs, prior permission and compliance with our guest policy are required.",
    },
  ],

  seo: {
    keywords: [
      "Premium Coliving in Kondapur",
      "Premium Coliving Spaces in Kondapur",
      "Best Coliving in Kondapur",
      "Coliving Spaces in Kondapur",
      "Coliving Near Botanical Garden",
      "Coliving Near Financial District",
      "Coliving Near Gachibowli",
      "Coliving Near HITEC City",
      "Fully Furnished Coliving Hyderabad",
      "Premium Stay in Hyderabad",
      "Luxury Coliving Hyderabad",
      "Modern Coliving Spaces",
      "Coliving for Working Professionals"
    ]
  }
};
