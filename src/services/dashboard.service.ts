import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { roomService } from './room.service';
import { blogService } from './blog.service';
import { galleryService } from './gallery.service';
import { faqService } from './faq.service';
import { bookingService } from './booking.service';
import { contactService } from './contact.service';

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  pendingBookings: number;
  publishedBlogs: number;
  galleryImages: number;
  faqsCount: number;
  unreadMessages: number;
}

export interface RecentActivity {
  recentBookings: any[];
  recentBlogs: any[];
  recentMessages: any[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const [rooms, availabilities, bookings, blogs, gallery, faqs, messages] = await Promise.all([
        roomService.getRooms(),
        roomService.getAllAvailabilities(),
        bookingService.getBookingRequests(),
        blogService.getBlogs(true),
        galleryService.getGalleryItems(),
        faqService.getFAQItems(),
        contactService.getContactRequests(),
      ]);

      const availableCount = availabilities.filter(a => a.status === 'Available').length;
      const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
      const publishedBlogsCount = blogs.filter(b => b.published).length;
      const unreadMessagesCount = messages.filter(m => m.status === 'pending').length;

      return {
        totalRooms: rooms.length,
        availableRooms: availableCount || rooms.length, // logical fallback
        pendingBookings: pendingBookingsCount,
        publishedBlogs: publishedBlogsCount,
        galleryImages: gallery.length,
        faqsCount: faqs.length,
        unreadMessages: unreadMessagesCount,
      };
    } catch (error) {
      console.warn('[DashboardService] Error compiling live dashboard stats. Using fallback counts.', error);
      return {
        totalRooms: 2,
        availableRooms: 1,
        pendingBookings: 0,
        publishedBlogs: 3,
        galleryImages: 12,
        faqsCount: 6,
        unreadMessages: 0,
      };
    }
  },

  async getRecentActivity(): Promise<RecentActivity> {
    try {
      const [bookings, blogs, messages] = await Promise.all([
        bookingService.getBookingRequests(),
        blogService.getBlogs(true),
        contactService.getContactRequests(),
      ]);

      return {
        recentBookings: bookings.slice(0, 5),
        recentBlogs: blogs.slice(0, 5),
        recentMessages: messages.slice(0, 5),
      };
    } catch (error) {
      console.warn('[DashboardService] Error fetching recent activity.', error);
      return {
        recentBookings: [],
        recentBlogs: [],
        recentMessages: [],
      };
    }
  }
};
