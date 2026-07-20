import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { ContactRequest } from '@/types';

export const contactService = {
  async submitContactRequest(request: Omit<ContactRequest, 'status' | 'createdAt'>): Promise<string> {
    const fullRequest: ContactRequest = {
      ...request,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const localRequests = JSON.parse(localStorage.getItem('botanical_contact_requests') || '[]');
    const localId = 'local_' + Math.random().toString(36).substr(2, 9);
    localRequests.push({ id: localId, ...fullRequest });
    localStorage.setItem('botanical_contact_requests', JSON.stringify(localRequests));

    if (!db) {
      console.log('[ContactService] Firebase not initialized. Stored locally.');
      return localId;
    }

    const path = 'contactRequests';
    try {
      const docRef = await addDoc(collection(db, path), fullRequest);
      console.log('[ContactService] Contact request submitted to Firestore. Doc ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.warn('[ContactService] Failed to submit contact query to Firestore due to permission or connection issues. Saved locally and proceeding.', error);
      return localId;
    }
  },

  async getContactRequests(): Promise<ContactRequest[]> {
    if (!db) {
      return JSON.parse(localStorage.getItem('botanical_contact_requests') || '[]');
    }
    try {
      const q = query(collection(db, 'contactRequests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: ContactRequest[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ContactRequest);
      });
      return list;
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return JSON.parse(localStorage.getItem('botanical_contact_requests') || '[]');
    }
  },

  subscribeContactRequests(callback: (requests: ContactRequest[]) => void): () => void {
    if (!db) {
      callback(JSON.parse(localStorage.getItem('botanical_contact_requests') || '[]'));
      return () => {};
    }

    const q = query(collection(db, 'contactRequests'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list: ContactRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ContactRequest);
      });
      callback(list);
    }, (error) => {
      console.error('[ContactService] Error subscribing to contact requests:', error);
    });
  },

  async updateContactStatus(id: string, status: ContactRequest['status'] | 'reviewed' | 'archived'): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await updateDoc(doc(db, 'contactRequests', id), { status });
  },

  async deleteContact(id: string): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await deleteDoc(doc(db, 'contactRequests', id));
  }
};
