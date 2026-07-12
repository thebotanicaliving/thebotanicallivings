import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { GalleryItem } from '@/types';

export const galleryService = {
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
      } else {
        console.log('[GalleryService] Gallery collection empty in Firestore. Returning fallback gallery items.');
        return [];
      }
    } catch (error) {
      console.warn('[GalleryService] Error fetching gallery items from Firestore. Using fallback data.', error);
      return [];
    }
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
