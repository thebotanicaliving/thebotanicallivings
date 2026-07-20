import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export interface HomepageConfig {
  id?: string;
  
  // Hero
  heroVideoUrl: string;
  heroImages?: string[];
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryBtnText: string;
  heroSecondaryBtnText: string;

  // Philosophy / Story
  storyTitle: string;
  storySubtitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyImageUrl: string;

  // Dining
  diningTitle: string;
  diningSubtitle: string;
  diningDescription: string;
  diningImageUrl: string;
  diningHighlights: string[];

  // Cafe
  cafeTitle?: string;
  cafeDescription?: string;
  cafeImageUrl?: string;
  cafeHighlights?: string[];

  // Location / Contact Map
  locationTitle: string;
  locationSubtitle: string;
  locationAddress: string;
  locationMapEmbedUrl: string;

  // Virtual Tour
  tourTitle: string;
  tourSubtitle: string;
  tourVideoUrl: string;

  // CTA
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;

  // Services
  services?: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
}

export const defaultHomepageConfig: HomepageConfig = {
  heroVideoUrl: 'https://www.pexels.com/download/video/27807339/',
  heroImages: [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop'
  ],
  heroTitle: 'A Premium Botanical Sanctuary for Mindful Living',
  heroSubtitle: 'Where organic luxury meets flawless convenience in Kondapur, Hyderabad. Uncover spaces crafted for deep focus, rich community, and restorative peace.',
  heroPrimaryBtnText: 'Secure Your Suite',
  heroSecondaryBtnText: 'Experience Virtual Tour',

  storyTitle: 'The Botanical Living Story',
  storySubtitle: 'A Refined Living Experience Rooted in Biophilia',
  storyParagraph1: 'We believe that our living environment directly influences our productivity, focus, and personal peace. Created as an antidote to dull, uninspired hostels and traditional chaotic rental spaces, Botanical Living merges natural wooden warmth, abundant organic houseplants, and modern minimalist architecture.',
  storyParagraph2: 'Every detail is curated to nurture professional drive and spiritual balance. We take full responsibility for daily chores, meals, and laundry, freeing up your energy to focus on what matters most to your journey.',
  storyImageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop',

  diningTitle: 'Organic & Homely Gastronomy',
  diningSubtitle: 'Nourishing, Freshly Prepared Meals Served Daily',
  diningDescription: 'Outsource your meal planning entirely. We serve wholesome, hygienic, freshly prepared meals in-house, balancing nutritious recipes and local flavors. Enjoy 6 days of delicious premium non-veg delicacies weekly in our spacious, sunlit communal dining room.',
  diningImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
  diningHighlights: [
    'Freshly Prepared Homely Meals Daily',
    'Nutritionally Balanced Diet Plans',
    '6 Days Premium Non-Veg Dishes Weekly',
    'Hygienic Communal Dining Room'
  ],

  cafeTitle: 'The Signature Botanical Café',
  cafeDescription: 'Perched elegantly on our rooftop, the Botanical Café is our signature sanctuary. Specially designed for software professionals and creators, it offers premium coffee, high-speed connectivity, and magnificent panoramic views of Kondapur.',
  cafeImageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec41b504?q=80&w=1200&auto=format&fit=crop',
  cafeHighlights: [
    'Rooftop Café Experience',
    'High-Speed Study/Work Desks',
    'Organic Brews & Fresh Tiffins',
    'Magnificent Panoramic Rooftop Views'
  ],

  locationTitle: 'An Oasis in India’s Silicon Valley',
  locationSubtitle: 'Unmatched Connectivity and Serene Surrounding Gardens',
  locationAddress: 'Sri Ram Nagar, Botanical Garden Road, Kondapur, Hyderabad, Telangana, 500084',
  locationMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.2755254247855!2d78.3582453!3d17.4465432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93ef423bc2e9%3A0x67db91c0e3a4e98f!2sBotanical%20Garden%20Rd%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',

  tourTitle: 'Unveil Your Future Home',
  tourSubtitle: 'Take a High-Definition Virtual Journey Through Botanical Living',
  tourVideoUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1920&auto=format&fit=crop',

  ctaTitle: 'Ready to Experience Botanical Living?',
  ctaSubtitle: 'Limited premium suites available. Submit a booking query to schedule a private walkthrough and secure your space today.',
  ctaButtonText: 'Submit Booking Enquiry',

  services: [
    { id: '1', title: 'Daily Housekeeping', description: 'Immaculate deep cleaning every day to ensure your sanctuary remains spotless.', icon: 'sparkles' },
    { id: '2', title: 'High-Speed Wi-Fi', description: 'Enterprise-grade connectivity for seamless remote work and entertainment.', icon: 'wifi' },
    { id: '3', title: 'Premium Meals', description: 'Wholesome, freshly prepared meals served thrice daily in our communal dining area.', icon: 'coffee' },
    { id: '4', title: '24/7 Security', description: 'Round-the-clock security and surveillance for your absolute peace of mind.', icon: 'shield' }
  ]
};

export const homepageService = {
  subscribeHomepageConfig(callback: (config: HomepageConfig) => void) {
    if (!db) {
      callback(defaultHomepageConfig);
      return () => {};
    }

    const docRef = doc(db, 'homepage', 'config');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...defaultHomepageConfig, ...docSnap.data() } as HomepageConfig);
      } else {
        callback(defaultHomepageConfig);
      }
    });
  },

  async getHomepageConfig(): Promise<HomepageConfig> {
    if (!db) {
      return defaultHomepageConfig;
    }
    try {
      const docRef = doc(db, 'homepage', 'config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.heroVideoUrl || data.heroVideoUrl.includes('mixkit.co') || data.heroVideoUrl.includes('drive.google.com')) {
          data.heroVideoUrl = 'https://www.pexels.com/download/video/27807339/';
          setDoc(docRef, { heroVideoUrl: data.heroVideoUrl }, { merge: true }).catch(err => 
            console.error('[HomepageService] Failed to migrate heroVideoUrl:', err)
          );
        }
        return { ...defaultHomepageConfig, ...data } as HomepageConfig;
      }
      return defaultHomepageConfig;
    } catch (error: any) {
      if (error?.message?.includes('Missing or insufficient permissions')) {
        console.warn('[HomepageService] Using default config (waiting for Firestore rules setup)');
      } else {
        console.warn('[HomepageService] Failed to fetch homepage config from Firestore. Using defaults.', error);
      }
      return defaultHomepageConfig;
    }
  },

  async updateHomepageConfig(config: Partial<HomepageConfig>): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    const docRef = doc(db, 'homepage', 'config');
    await setDoc(docRef, config, { merge: true });
  }
};
