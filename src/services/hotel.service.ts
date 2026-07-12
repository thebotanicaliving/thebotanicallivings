import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { HotelConfig } from '@/types';

const defaultHotelConfig = {} as HotelConfig;

export const hotelService = {
  async getHotelConfig(): Promise<HotelConfig> {
    if (!db) {
      console.log('[HotelService] Firebase not initialized. Using local config.');
      return defaultHotelConfig;
    }

    try {
      const docRef = doc(db, 'hotel', 'config');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as HotelConfig;
      } else {
        console.log('[HotelService] Config document not found in Firestore. Returning fallback.');
        return defaultHotelConfig;
      }
    } catch (error) {
      console.warn('[HotelService] Error fetching hotel config from Firestore. Using fallback data.', error);
      return defaultHotelConfig;
    }
  },

  async updateHotelConfig(config: Partial<HotelConfig>): Promise<void> {
    if (!db) {
      console.warn('[HotelService] Firebase not initialized. Update would be local only.');
      return;
    }
    try {
      const docRef = doc(db, 'hotel', 'config');
      await setDoc(docRef, config, { merge: true });
    } catch (error) {
      console.error('[HotelService] Error updating hotel config:', error);
      throw error;
    }
  }
};
