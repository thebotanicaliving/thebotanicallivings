import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { FAQItem } from '@/types';

export const faqService = {
  subscribeFAQ(callback: (items: FAQItem[]) => void) {
    if (!db) {
      callback([]);
      return () => {};
    }

    const faqCol = collection(db, 'faq');
    const qWithOrder = query(faqCol, orderBy('displayOrder', 'asc'));

    let activeUnsubscribe: (() => void) | null = null;

    try {
      activeUnsubscribe = onSnapshot(qWithOrder, (querySnapshot) => {
        const items: FAQItem[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as FAQItem);
        });
        callback(items);
      }, (error) => {
        console.warn('[FAQService] subscribeFAQ with orderBy failed. Retrying with simple query...', error);
        
        if (activeUnsubscribe) {
          activeUnsubscribe();
        }

        try {
          const qSimple = query(faqCol);
          activeUnsubscribe = onSnapshot(qSimple, (querySnapshot) => {
            const items: FAQItem[] = [];
            querySnapshot.forEach((docSnap) => {
              items.push({ id: docSnap.id, ...docSnap.data() } as FAQItem);
            });
            items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            callback(items);
          }, (innerError) => {
            console.error('[FAQService] Fallback subscribeFAQ failed:', innerError);
            callback([]);
          });
        } catch (e) {
          console.error('[FAQService] Fallback setup error:', e);
          callback([]);
        }
      });
    } catch (err) {
      console.error('[FAQService] subscribeFAQ setup error:', err);
      callback([]);
    }

    return () => {
      if (activeUnsubscribe) {
        activeUnsubscribe();
      }
    };
  },

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
      }
    } catch (error) {
      console.warn('[FAQService] Error fetching FAQ items with orderBy. Retrying with simple query.', error);
    }

    try {
      const qSimple = query(collection(db, path));
      const querySnapshot = await getDocs(qSimple);
      if (!querySnapshot.empty) {
        const items: FAQItem[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as FAQItem);
        });
        items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        return items;
      }
    } catch (innerError) {
      console.error('[FAQService] Failed to retrieve FAQ items completely:', innerError);
    }
    return [];
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
