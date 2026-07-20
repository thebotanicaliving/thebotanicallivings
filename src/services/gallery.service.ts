import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { GalleryItem } from '@/types';

export const galleryService = {
  subscribeGallery(callback: (items: GalleryItem[]) => void) {
    if (!db) {
      callback([]);
      return () => {};
    }

    const galleryCol = collection(db, 'gallery');
    const qWithOrder = query(galleryCol, orderBy('displayOrder', 'asc'));

    let activeUnsubscribe: (() => void) | null = null;

    try {
      activeUnsubscribe = onSnapshot(qWithOrder, (querySnapshot) => {
        const items: GalleryItem[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as GalleryItem);
        });
        callback(items);
      }, (error) => {
        console.warn('[GalleryService] subscribeGallery with orderBy failed. Retrying with simple query...', error);
        
        if (activeUnsubscribe) {
          activeUnsubscribe();
        }

        try {
          const qSimple = query(galleryCol);
          activeUnsubscribe = onSnapshot(qSimple, (querySnapshot) => {
            const items: GalleryItem[] = [];
            querySnapshot.forEach((docSnap) => {
              items.push({ id: docSnap.id, ...docSnap.data() } as GalleryItem);
            });
            items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            callback(items);
          }, (innerError) => {
            console.error('[GalleryService] Fallback subscribeGallery failed:', innerError);
            callback([]);
          });
        } catch (e) {
          console.error('[GalleryService] Fallback setup error:', e);
          callback([]);
        }
      });
    } catch (err) {
      console.error('[GalleryService] subscribeGallery setup error:', err);
      callback([]);
    }

    return () => {
      if (activeUnsubscribe) {
        activeUnsubscribe();
      }
    };
  },

  async getGalleryItems(): Promise<GalleryItem[]> {
    if (!db) {
      console.log('[GalleryService] Firebase not initialized. Using fallback gallery items.');
      return [];
    }

    const path = 'gallery';
    try {
      const q = query(collection(db, path), orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const items: GalleryItem[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as GalleryItem);
        });
        return items;
      }
    } catch (error) {
      console.warn('[GalleryService] Error fetching gallery items with orderBy. Retrying with simple query.', error);
    }

    try {
      const qSimple = query(collection(db, path));
      const querySnapshot = await getDocs(qSimple);
      if (!querySnapshot.empty) {
        const items: GalleryItem[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as GalleryItem);
        });
        items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        return items;
      }
    } catch (innerError) {
      console.error('[GalleryService] Failed to retrieve gallery items completely:', innerError);
    }
    return [];
  },

  async createGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<string> {
    if (!db) throw new Error('Firebase not initialized');
    const newDocRef = doc(collection(db, 'gallery'));
    await setDoc(newDocRef, { ...item });
    return newDocRef.id;
  },

  async updateGalleryItem(id: string, item: Partial<GalleryItem>): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await updateDoc(doc(db, 'gallery', id), item);
  },

  async deleteGalleryItem(id: string): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await deleteDoc(doc(db, 'gallery', id));
  }
};
