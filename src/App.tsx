import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { Routes as RouterRoutes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar, Footer, PageWrapper, StickyConversionBar } from '@/components/layout';
import { WhatsAppWidget } from '@/components/shared';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { Hero } from '@/features/home/components/Hero';

// Lazy load below-the-fold components to improve initial page load and RAM usage
const Story = lazy(() => import('@/features/home/components/Story'));
const WhyBotanical = lazy(() => import('@/features/home/components/WhyBotanical'));
const RoomsPreview = lazy(() => import('@/features/home/components/RoomsPreview'));
const AmenitiesPreview = lazy(() => import('@/features/home/components/AmenitiesPreview'));
const BotanicalCafe = lazy(() => import('@/features/home/components/BotanicalCafe'));
const Dining = lazy(() => import('@/features/home/components/Dining'));
const Lifestyle = lazy(() => import('@/features/home/components/Lifestyle'));
const Gallery = lazy(() => import('@/features/home/components/Gallery'));
const Testimonials = lazy(() => import('@/features/home/components/Testimonials'));
const Location = lazy(() => import('@/features/home/components/Location'));
const Faq = lazy(() => import('@/features/home/components/FAQ'));
const FinalCta = lazy(() => import('@/features/home/components/FinalCta'));

// Import newly implemented Phase 2 dynamic pages
import { RoomsPage } from '@/features/rooms/RoomsPage';
import { RoomDetailsPage } from '@/features/rooms/RoomDetailsPage';
import { BlogPage } from '@/features/blogs/BlogPage';
import { BlogDetailsPage } from '@/features/blogs/BlogDetailsPage';
import { GalleryPage } from '@/features/gallery/GalleryPage';
import { VirtualTourPage } from '@/features/virtual-tour/VirtualTourPage';
import { FaqPage } from '@/features/faq/FaqPage';
import { BookingPage } from '@/features/booking/BookingPage';
import { BookingStatusPage } from '@/features/booking/BookingStatusPage';
import { ContactPage } from '@/features/contact/ContactPage';
import { PrivacyPolicyPage } from '@/features/legal/PrivacyPolicyPage';
import { TermsPage } from '@/features/legal/TermsPage';

// Admin imports
import { Login } from '@/features/admin/Login';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Dashboard } from '@/features/admin/Dashboard';
import { RoomsList } from '@/features/admin/rooms/RoomsList';
import { RoomForm } from '@/features/admin/rooms/RoomForm';
import { BookingsList } from '@/features/admin/bookings/BookingsList';
import { BookingDetails } from '@/features/admin/bookings/BookingDetails';
import { MessagesList } from '@/features/admin/messages/MessagesList';
import { MessageDetails } from '@/features/admin/messages/MessageDetails';
import { SettingsForm } from '@/features/admin/settings/SettingsForm';
import { HomepageCMS } from '@/features/admin/homepage/HomepageCMS';
import { BlogsList } from '@/features/admin/blogs/BlogsList';
import { BlogForm } from '@/features/admin/blogs/BlogForm';
import { GalleryCMS } from '@/features/admin/gallery/GalleryCMS';
import { FAQCMS } from '@/features/admin/faqs/FAQCMS';
import { ReviewCMS } from '@/features/admin/reviews/ReviewCMS';
import { ImportData } from '@/features/admin/import/ImportData';
import { AvailabilityPage } from '@/features/admin/availability/AvailabilityPage';
import { AdminsPage } from '@/features/admin/admins/AdminsPage';
import { useSettings } from '@/hooks/useSettings';
import { Assets } from '@/constants/assets';
import { getDirectMediaUrl } from '@/utils/media';

// Simple, effective Scroll Restoration to top on path change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [pathname]);
  return null;
}

// Extract homepage into a dedicated layout view
function HomeView() {
  return (
    <PageWrapper id="homepage">
      {/* cinematic landing experience */}
      <Hero />

      <Suspense fallback={<div className="h-20 bg-dark-forest" />}>
        {/* philosophy of brand */}
        <Story />

        {/* 6-card grid explaining value proposition */}
        <WhyBotanical />

        {/* premium sharing options cards with pricing */}
        <RoomsPreview />

        {/* bespoke hospitality amenities grid */}
        <AmenitiesPreview />

        {/* dedicated rooftop experience section */}
        <BotanicalCafe />

        {/* culinary experience showcase */}
        <Dining />

        {/* conscious community collage */}
        <Lifestyle />

        {/* editorial aesthetic moments */}
        <Gallery />

        {/* guest experiences carousel */}
        <Testimonials />

        {/* maps & connectivity context with nearby places grid */}
        <Location />

        {/* FAQs list with SEO schema */}
        <Faq />

        {/* priority reservations call to action */}
        <FinalCta />
      </Suspense>
    </PageWrapper>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomeRoute = location.pathname === '/';
  const { settings } = useSettings();
  
  const [isPreloading, setIsPreloading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [heroVideoLoaded, setHeroVideoLoaded] = useState(false);
  const didStartFadeOut = useRef(false);

  useEffect(() => {
    if (isAdminRoute) {
      setIsPreloading(false);
      setIsFadingOut(false);
      return;
    }

    // Reset preloading state on route change to ensure a smooth transition overlay
    document.documentElement.setAttribute('data-preloading', 'true');
    setIsPreloading(true);
    setIsFadingOut(false);
    setHeroVideoLoaded(false);
    didStartFadeOut.current = false;

    let fadeOutTimeout: NodeJS.Timeout;
    let removeTimeout: NodeJS.Timeout;
    let fallbackTimeout: NodeJS.Timeout;

    const triggerFadeOut = (delay = 0) => {
      if (didStartFadeOut.current) return;
      didStartFadeOut.current = true;
      
      fadeOutTimeout = setTimeout(() => {
        setIsFadingOut(true);
        document.documentElement.setAttribute('data-preloading', 'fading');
        window.dispatchEvent(new CustomEvent('loader-fading-out'));
        removeTimeout = setTimeout(() => {
          setIsPreloading(false);
          document.documentElement.removeAttribute('data-preloading');
          window.dispatchEvent(new CustomEvent('loader-done'));
        }, 700); // Allow fadeout transition (700ms) to complete
      }, delay);
    };

    const handleVideoLoaded = () => {
      setHeroVideoLoaded(true);
      if (isHomeRoute) {
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        triggerFadeOut(600); // Smooth premium delay before fade out
      }
    };

    window.addEventListener('hero-video-loaded', handleVideoLoaded);

    // Fallback timer: 2s for home route (images load fast), 600ms for other routes to feel snappy
    const maxTimeout = isHomeRoute ? 2000 : 600;
    fallbackTimeout = setTimeout(() => {
      triggerFadeOut(0);
    }, maxTimeout);

    const handleLoad = () => {
      if (!isHomeRoute) {
        triggerFadeOut(100);
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('hero-video-loaded', handleVideoLoaded);
      window.removeEventListener('load', handleLoad);
      if (fadeOutTimeout) clearTimeout(fadeOutTimeout);
      if (removeTimeout) clearTimeout(removeTimeout);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      document.documentElement.removeAttribute('data-preloading');
    };
  }, [location.pathname, isHomeRoute, isAdminRoute]);

  return (
    <>
      <ScrollToTop />
      <SchemaMarkup />
      
      {/* Premium responsive navbar */}
      {!isAdminRoute && <Navbar />}

      {/* Client-side Router views */}
      <RouterRoutes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rooms" element={<RoomsList />} />
          <Route path="rooms/new" element={<RoomForm />} />
          <Route path="rooms/:id/edit" element={<RoomForm />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="messages" element={<MessagesList />} />
          <Route path="messages/:id" element={<MessageDetails />} />
          <Route path="settings" element={<SettingsForm />} />
          <Route path="homepage" element={<HomepageCMS />} />
          <Route path="blogs" element={<BlogsList />} />
          <Route path="blogs/new" element={<BlogForm />} />
          <Route path="blogs/:id/edit" element={<BlogForm />} />
          <Route path="gallery" element={<GalleryCMS />} />
          <Route path="faqs" element={<FAQCMS />} />
          <Route path="reviews" element={<ReviewCMS />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="import" element={<ImportData />} />
        </Route>
        <Route path="/" element={<HomeView />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:slug" element={<RoomDetailsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/virtual-tour" element={<VirtualTourPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/status" element={<BookingStatusPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/get-in-touch" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
      </RouterRoutes>

      {/* structured site footer */}
      {!isAdminRoute && <Footer />}

      {/* Floating high-contrast WhatsApp widget */}
      {!isAdminRoute && <WhatsAppWidget />}

      {/* Persistent conversion bar for high-intent actions */}
      {!isAdminRoute && <StickyConversionBar />}

      {/* Elegant, seamless preloading loader */}
      {isPreloading && !isAdminRoute && (
        <div 
          className={`fixed inset-0 bg-dark-forest z-[99999] flex flex-col items-center justify-center select-none transition-opacity duration-700 ease-in-out ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="flex flex-col items-center space-y-6 animate-fadeIn text-center">
            {/* Scaled Up Logo on top */}
            <img 
              src={getDirectMediaUrl(settings?.logoUrl) || Assets.logos.icon} 
              alt="Botanical Living Logo" 
              className="w-24 h-24 object-contain brightness-0 invert"
            />
            {/* Wordmark below the Logo */}
            <img 
              src={getDirectMediaUrl(settings?.wordmarkUrl) || Assets.logos.wordmark} 
              alt="Botanical Living Wordmark" 
              className="h-8 object-contain brightness-0 invert"
            />

            {/* Circular loader below the Wordmark */}
            <div className="relative flex items-center justify-center pt-2">
              <div className="w-10 h-10 border-2 border-white/15 border-t-white rounded-full animate-spin" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
