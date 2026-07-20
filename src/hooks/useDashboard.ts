import { useState, useEffect } from 'react';
import { DashboardStats, RecentActivity } from '@/services/dashboard.service';
import { roomService } from '@/services/room.service';
import { bookingService } from '@/services/booking.service';
import { contactService } from '@/services/contact.service';
import { blogService } from '@/services/blog.service';
import { galleryService } from '@/services/gallery.service';
import { faqService } from '@/services/faq.service';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let rooms: any[] = [];
    let availabilities: any[] = [];
    let bookings: any[] = [];
    let blogs: any[] = [];
    let messages: any[] = [];
    let gallery: any[] = [];
    let faqs: any[] = [];

    setLoading(true);

    const updateDashboard = () => {
      const availableCount = availabilities.filter(a => a.status === 'Available').length;
      const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
      const publishedBlogsCount = blogs.filter(b => b.published).length;
      const unreadMessagesCount = messages.filter(m => m.status === 'pending').length;

      setStats({
        totalRooms: rooms.length,
        availableRooms: availableCount || rooms.length,
        pendingBookings: pendingBookingsCount,
        publishedBlogs: publishedBlogsCount,
        galleryImages: gallery.length,
        faqsCount: faqs.length,
        unreadMessages: unreadMessagesCount,
      });

      setRecent({
        recentBookings: bookings.slice(0, 5),
        recentBlogs: blogs.slice(0, 5),
        recentMessages: messages.slice(0, 5),
      });

      setLoading(false);
    };

    // Subscriptions
    const unsubRooms = roomService.subscribeRooms(data => { rooms = data; updateDashboard(); });
    const unsubAvail = roomService.subscribeAllAvailabilities(data => { availabilities = data; updateDashboard(); });
    const unsubBookings = bookingService.subscribeBookings(data => { bookings = data; updateDashboard(); });
    const unsubBlogs = blogService.subscribeBlogs(data => { blogs = data; updateDashboard(); });
    const unsubMessages = contactService.subscribeContactRequests(data => { messages = data; updateDashboard(); });
    
    // For services without subscriptions yet, we can do a one-time fetch or add subscriptions later
    const fetchOthers = async () => {
      try {
        const [galleryData, faqData] = await Promise.all([
          galleryService.getGalleryItems(),
          faqService.getFAQItems()
        ]);
        gallery = galleryData;
        faqs = faqData;
        updateDashboard();
      } catch (e) {
        console.warn('Dashboard others fetch error', e);
      }
    };
    fetchOthers();

    return () => {
      unsubRooms();
      unsubAvail();
      unsubBookings();
      unsubBlogs();
      unsubMessages();
    };
  }, []);

  return { stats, recent, loading, error };
}
