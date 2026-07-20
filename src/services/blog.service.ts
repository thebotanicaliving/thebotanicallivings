import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { Blog } from '@/types';

export const blogService = {
  async getBlogs(includeUnpublished: boolean = false): Promise<Blog[]> {
    if (!db) {
      console.log('[BlogService] Firebase not initialized. Using fallback blogs.');
      return [];
    }

    const path = 'blogs';
    try {
      const q = collection(db, path);
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const blogs: Blog[] = [];
        querySnapshot.forEach((docSnap) => {
          blogs.push({ id: docSnap.id, ...docSnap.data() } as Blog);
        });
        
        // Filter & Sort in memory:
        const filtered = includeUnpublished ? blogs : blogs.filter((b) => b.published === true);
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return filtered;
      } else {
        console.log('[BlogService] Blogs collection is empty. Returning fallback blogs.');
        return [];
      }
    } catch (error) {
      console.warn('[BlogService] Error fetching blogs from Firestore. Using fallback data.', error);
      return [];
    }
  },

  subscribeBlogs(callback: (blogs: Blog[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const q = collection(db, 'blogs');
    return onSnapshot(q, (snapshot) => {
      const blogs: Blog[] = [];
      snapshot.forEach((docSnap) => {
        blogs.push({ id: docSnap.id, ...docSnap.data() } as Blog);
      });
      blogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(blogs);
    }, (error) => {
      console.error('[BlogService] Error subscribing to blogs:', error);
    });
  },

  async createBlog(blog: Omit<Blog, 'id'>): Promise<string> {
    if (!db) throw new Error('Firebase not initialized');
    const newDocRef = doc(collection(db, 'blogs'));
    await setDoc(newDocRef, { ...blog, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return newDocRef.id;
  },

  async updateBlog(blogId: string, blog: Partial<Blog>): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await updateDoc(doc(db, 'blogs', blogId), { ...blog, updatedAt: new Date().toISOString() });
  },

  async deleteBlog(blogId: string): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await deleteDoc(doc(db, 'blogs', blogId));
  },

  async getBlog(blogId: string): Promise<Blog | null> {
    if (!db) {
      return null;
    }
    try {
      const docSnap = await getDoc(doc(db, 'blogs', blogId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Blog;
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    }
    return null;
  },

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    if (!db) {
      return null;
    }

    const path = 'blogs';
    try {
      const q = query(collection(db, path), where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Blog;
      }
    } catch (error) {
      console.warn('[BlogService] Error fetching blog by slug from Firestore. Using fallback data.', error);
    }
    return null;
  },

  async getFeaturedBlog(): Promise<Blog | null> {
    try {
      const blogs = await this.getBlogs();
      return blogs.find((b) => b.featured) || blogs[0] || null;
    } catch (error) {
      console.error('[BlogService] Error getting featured blog:', error);
      return null;
    }
  }
};
