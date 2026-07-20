import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { ReviewItem } from '@/types';

const defaultReviews: Omit<ReviewItem, 'id'>[] = [
  {
    name: 'Rahul V.',
    role: 'Software Engineer',
    stayType: 'Single Suite',
    quote: 'The perfect place for deep work. The Wi-Fi is incredibly stable and the environment is so peaceful.',
    rating: 5,
    date: '2023-10-15',
    initials: 'RV',
    displayOrder: 1,
    published: true
  },
  {
    name: 'Priya M.',
    role: 'Data Scientist',
    stayType: 'Single Suite',
    quote: 'I love not having to worry about meals or cleaning. It saves me hours every week.',
    rating: 5,
    date: '2023-11-02',
    initials: 'PM',
    displayOrder: 2,
    published: true
  },
  {
    name: 'Arjun K.',
    role: 'Consultant',
    stayType: 'Two Sharing',
    quote: "Great community. I've met some amazing people here while maintaining my privacy.",
    rating: 5,
    date: '2023-09-28',
    initials: 'AK',
    displayOrder: 3,
    published: true
  },
  {
    name: 'Sneha R.',
    role: 'Designer',
    stayType: 'Two Sharing',
    quote: 'The aesthetic is beautiful. It really feels like a premium hotel, not a typical PG.',
    rating: 5,
    date: '2023-12-10',
    initials: 'SR',
    displayOrder: 4,
    published: true
  }
];

export const reviewsService = {
  async getReviews(): Promise<ReviewItem[]> {
    if (!db) {
      console.log('[ReviewsService] Firebase not initialized. Using fallback reviews.');
      return defaultReviews.map((r, idx) => ({ id: String(idx + 1), ...r }));
    }

    try {
      const q = query(collection(db, 'reviews'), orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const items: ReviewItem[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as ReviewItem);
        });
        return items;
      } else {
        console.log('[ReviewsService] Reviews collection empty. Attempting auto-seed...');
        const items: ReviewItem[] = [];
        try {
          for (const item of defaultReviews) {
            const newDocRef = doc(collection(db, 'reviews'));
            await setDoc(newDocRef, item);
            items.push({ id: newDocRef.id, ...item });
          }
          return items;
        } catch (seedError) {
          console.log('[ReviewsService] Seeding reviews requires admin privileges. Returning local fallback reviews.');
          return defaultReviews.map((r, idx) => ({ id: String(idx + 1), ...r }));
        }
      }
    } catch (error) {
      console.log('[ReviewsService] Note: Using fallback reviews due to Firestore permissions or connectivity.', error);
      return defaultReviews.map((r, idx) => ({ id: String(idx + 1), ...r }));
    }
  },

  async createReview(item: Omit<ReviewItem, 'id'>): Promise<string> {
    if (!db) throw new Error('Firebase not initialized');
    const newDocRef = doc(collection(db, 'reviews'));
    await setDoc(newDocRef, { ...item });
    return newDocRef.id;
  },

  async updateReview(id: string, item: Partial<ReviewItem>): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await updateDoc(doc(db, 'reviews', id), item);
  },

  async deleteReview(id: string): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await deleteDoc(doc(db, 'reviews', id));
  }
};
