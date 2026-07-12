import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { FAQItem } from '@/types';

export const faqService = {
  async getFAQItems(): Promise<FAQItem[]> {
    if (!db) {
      console.log('[FAQService] Firebase not initialized. Using fallback FAQ items.');
      return [];
    }

    const path = 'faq';
    try {
      const q = query(collection(db, path), orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const items: FAQItem[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as FAQItem);
        });
        return items;
      } else {
        console.log('[FAQService] FAQ collection empty in Firestore. Returning fallback FAQ items.');
        return [];
      }
    } catch (error) {
      console.warn('[FAQService] Error fetching FAQ items from Firestore. Using fallback data.', error);
      return [];
    }
  },

  async createFAQItem(item: Omit<FAQItem, 'id'>): Promise<string> {
    if (!db) throw new Error('Firebase not initialized');
    const newDocRef = doc(collection(db, 'faq'));
    await setDoc(newDocRef, { ...item });
    return newDocRef.id;
  },

  async updateFAQItem(id: string, item: Partial<FAQItem>): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await updateDoc(doc(db, 'faq', id), item);
  },

  async deleteFAQItem(id: string): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await deleteDoc(doc(db, 'faq', id));
  }
};
