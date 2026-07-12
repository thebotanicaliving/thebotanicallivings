import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { Room, RoomAvailability } from '@/types';

const defaultRooms = [
  {
    id: 'single-sharing',
    slug: 'single-sharing',
    title: 'Single Sharing Suite',
    shortDescription: 'A private sanctuary designed for the modern professional seeking comfort and focus.',
    description: 'Our Single Sharing Suite offers complete privacy with premium furnishings and an en-suite bathroom. Experience tranquility in a space designed exclusively for you, featuring a dedicated workspace, ample storage, and abundant natural light.',
    price: '₹28,500',
    priceSuffix: 'per month',
    occupancy: 1,
    roomSize: '220 sq ft',
    maxCapacity: 1,
    currentResidents: 0,
    featured: true,
    published: true,
    displayOrder: 1,
    coverImage: 'https://images.unsplash.com/photo-1522771731570-01020f5c010c?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1522771731570-01020f5c010c?q=80&w=1200&auto=format&fit=crop'
    ],
    amenities: ['Air Conditioning', 'En-suite Bathroom', 'Workspace', 'Smart TV', 'Mini Fridge'],
    services: ['Daily Housekeeping', 'Laundry Service', 'High-Speed WiFi']
  }
] as any[];

const defaultAvailability = {
  'single-sharing': {
    roomId: 'single-sharing',
    totalRooms: 5,
    availableRooms: 2,
    status: 'Available',
    nextAvailableDate: null
  }
} as any;


export const roomService = {
  async getRooms(): Promise<Room[]> {
    if (!db) {
      console.log('[RoomService] Firebase not initialized. Using fallback rooms list.');
      return [];
    }

    const path = 'rooms';
    try {
      const q = query(collection(db, path), orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const rooms: Room[] = [];
        querySnapshot.forEach((docSnap) => {
          rooms.push({ id: docSnap.id, ...docSnap.data() } as Room);
        });
        return rooms;
      } else {
        console.log('[RoomService] Rooms collection empty in Firestore. Returning fallback rooms.');
        return [];
      }
    } catch (error) {
      console.warn('[RoomService] Error fetching rooms from Firestore. Using fallback data.', error);
      return [];
    }
  },

  async createRoom(room: Omit<Room, 'id'>): Promise<string> {
    if (!db) throw new Error('Firebase not initialized');
    const newDocRef = doc(collection(db, 'rooms'));
    await setDoc(newDocRef, { ...room, createdAt: new Date().toISOString() });
    return newDocRef.id;
  },

  async updateRoom(roomId: string, room: Partial<Room>): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await updateDoc(doc(db, 'rooms', roomId), { ...room, updatedAt: new Date().toISOString() });
  },

  async deleteRoom(roomId: string): Promise<void> {
    if (!db) throw new Error('Firebase not initialized');
    await deleteDoc(doc(db, 'rooms', roomId));
  },

  async getRoom(id: string): Promise<Room | null> {
    if (!db) return null;
    try {
      const docSnap = await getDoc(doc(db, 'rooms', id));
      if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Room;
    } catch (e) {
      console.warn('Error fetching room', e);
    }
    return null;
  },

  async getRoomBySlug(slug: string): Promise<Room | null> {
    if (!db) {
      const room = defaultRooms.find((r) => r.slug === slug);
      return room || null;
    }

    const path = 'rooms';
    try {
      const q = query(collection(db, path), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Room;
      }
    } catch (error) {
      console.warn('[RoomService] Error fetching room by slug from Firestore. Using fallback data.', error);
    }

    // Fallback check in default data
    const room = defaultRooms.find((r) => r.slug === slug);
    return room || null;
  },

  async getRoomAvailability(roomId: string): Promise<RoomAvailability> {
    const fallback = defaultAvailability[roomId] || {
      roomId,
      status: 'Available',
      availableRooms: 5,
      totalRooms: 10,
      lastUpdated: 'Updated just now'
    };

    if (!db) {
      return { status: "Available", availableRooms: 0, totalRooms: 0, lastUpdated: "", roomId: "" };
    }

    try {
      const docRef = doc(db, 'roomAvailability', roomId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as RoomAvailability;
      } else {
        console.log(`[RoomService] Availability not found for roomId: ${roomId}. Returning fallback.`);
        return { status: "Available", availableRooms: 0, totalRooms: 0, lastUpdated: "", roomId: "" };
      }
    } catch (error) {
      console.warn(`[RoomService] Error fetching room availability for ${roomId} from Firestore. Using fallback data.`, error);
      return { status: "Available", availableRooms: 0, totalRooms: 0, lastUpdated: "", roomId: "" };
    }
  },

  async getAllAvailabilities(): Promise<RoomAvailability[]> {
    if (!db) {
      return Object.values(defaultAvailability);
    }

    const path = 'roomAvailability';
    try {
      const querySnapshot = await getDocs(collection(db, path));

      if (!querySnapshot.empty) {
        const list: RoomAvailability[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push(docSnap.data() as RoomAvailability);
        });
        return list;
      } else {
        console.log('[RoomService] Availability collection empty in Firestore. Returning fallback availabilities.');
        return Object.values(defaultAvailability);
      }
    } catch (error) {
      console.warn('[RoomService] Error fetching all availabilities from Firestore. Using fallback data.', error);
      return Object.values(defaultAvailability);
    }
  }
};
