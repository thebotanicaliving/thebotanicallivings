import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

export interface BusinessSettings {
  id?: string;
  hotelName: string;
  tagline: string;
  primaryEmail: string;
  phone: string;
  whatsapp: string;
  address: string;
  googleMapsEmbed: string;
  googleMapsShare: string;
  virtualTour: string;
  checkInTime: string;
  checkOutTime: string;
  businessHours: string;
  
  // Branding
  logoUrl: string;
  wordmarkUrl: string;
  faviconUrl: string;
  heroVideoUrl: string;
  socialShareImage: string;

  // Socials
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  twitter: string;

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  canonicalUrl: string;
}

export const defaultSettings: BusinessSettings = {
  hotelName: 'Botanical Living',
  tagline: 'Premium Co-Living Sanctuary',
  primaryEmail: 'hello@botanicalliving.in',
  phone: '+91 91000 12345',
  whatsapp: '+91 91000 12345',
  address: 'Sri Ram Nagar, Botanical Garden Road, Kondapur, Hyderabad, 500084',
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.2755254247855!2d78.3582453!3d17.4465432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93ef423bc2e9%3A0x67db91c0e3a4e98f!2sBotanical%20Garden%20Rd%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  googleMapsShare: 'https://maps.app.goo.gl/botanicalliving',
  virtualTour: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1920&auto=format&fit=crop',
  checkInTime: '12:00 PM',
  checkOutTime: '11:00 AM',
  businessHours: '9:00 AM - 9:00 PM Daily',
  
  logoUrl: '',
  wordmarkUrl: '',
  faviconUrl: '/favicon.ico',
  heroVideoUrl: 'https://drive.google.com/file/d/1zqPtZ2F1NFiPJ9xZ_ffvdq7O3y4noien/view?usp=sharing',
  socialShareImage: '',

  instagram: 'https://instagram.com/botanical.living',
  facebook: 'https://facebook.com/botanical.living',
  linkedin: 'https://linkedin.com/company/botanical-living',
  youtube: 'https://youtube.com/c/botanicalliving',
  twitter: 'https://twitter.com/botanical_living',

  seoTitle: 'Botanical Living - Premium Eco-Luxury Co-Living in Kondapur, Hyderabad',
  seoDescription: 'Fully serviced luxury rooms with daily cleaning, in-house laundry, delicious homely food, 24/7 security, high-speed Wi-Fi, and a rooftop study cafe.',
  seoKeywords: 'co-living Hyderabad, premium hostel Kondapur, serviced rooms Hitech city, luxury co-living Hyderabad',
  ogImage: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop',
  canonicalUrl: 'https://botanicalliving.in'
};

export const settingsService = {
  async getSettings(): Promise<BusinessSettings> {
    if (!db) {
      console.log('[SettingsService] Firebase not initialized. Using defaults.');
      return defaultSettings;
    }
    try {
      const docRef = doc(db, 'settings', 'general');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.heroVideoUrl || data.heroVideoUrl.includes('mixkit.co')) {
          data.heroVideoUrl = 'https://drive.google.com/file/d/1zqPtZ2F1NFiPJ9xZ_ffvdq7O3y4noien/view?usp=sharing';
          setDoc(docRef, { heroVideoUrl: data.heroVideoUrl }, { merge: true }).catch(err => 
            console.error('[SettingsService] Failed to migrate heroVideoUrl:', err)
          );
        }
        return { ...defaultSettings, ...data } as BusinessSettings;
      }
      return defaultSettings;
    } catch (error: any) {
      if (error?.message?.includes('Missing or insufficient permissions')) {
        console.warn('[SettingsService] Using default settings (waiting for Firestore rules setup)');
      } else {
        console.warn('[SettingsService] Failed to retrieve settings from Firestore. Using defaults.', error);
      }
      return defaultSettings;
    }
  },

  async updateSettings(settings: Partial<BusinessSettings>): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, settings, { merge: true });
  }
};
