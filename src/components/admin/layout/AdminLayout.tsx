import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Hotel, CalendarDays, BedDouble, FileText, Image, HelpCircle, Star, Home, MessageSquare, Settings, LogOut, Database, Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/shared';
import { authService } from '@/services/auth.service';
import { AdminGlobalSearch } from './AdminGlobalSearch';
import { useSettings } from '@/hooks/useSettings';
import { getDirectMediaUrl } from '@/utils/media';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Rooms', path: '/admin/rooms', icon: Hotel },
  { name: 'Availability', path: '/admin/availability', icon: CalendarDays },
  { name: 'Bookings', path: '/admin/bookings', icon: BedDouble },
  { name: 'Blogs', path: '/admin/blogs', icon: FileText },
  { name: 'Gallery', path: '/admin/gallery', icon: Image },
  { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Homepage', path: '/admin/homepage', icon: Home },
  { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { name: 'Admins', path: '/admin/admins', icon: Shield },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
  { name: 'Import Data', path: '/admin/import', icon: Database },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Set page title and meta tags
  useEffect(() => {
    document.title = 'Admin | Botanical Living';
    
    // Manage SEO meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Botanical Living - High-End Hospitality & Luxury Stays Administrative Portal.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Botanical Living - High-End Hospitality & Luxury Stays Administrative Portal.';
      document.head.appendChild(meta);
    }
  }, []);

  // Close sidebar on navigation changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-stone-50 overflow-x-hidden">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowLogoutConfirm(false)} />
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 md:p-8 border border-border/30 shadow-2xl relative z-10 animate-scaleUp">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <LogOut size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading text-lg font-medium text-dark-forest">Confirm Sign Out</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-light">
                  Are you sure you want to sign out of the Botanical Living admin console? You will need to log back in to manage properties, rates, and bookings.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full text-xs font-semibold py-2.5 rounded-xl border-border/40 text-text-primary"
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleLogout}
                  className="w-full text-xs font-semibold py-2.5 rounded-xl bg-rose-600 border-rose-600 hover:bg-rose-700 hover:border-rose-700 text-white"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 animate-fadeIn"
        />
      )}

      {/* Sidebar - fully responsive */}
      <aside 
        className={`w-64 bg-dark-forest text-white flex flex-col fixed inset-y-0 z-50 transform lg:transform-none lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 p-1 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={getDirectMediaUrl(settings?.logoUrl) || 'https://lh3.googleusercontent.com/d/1PCe61WYkM1LeP6Elr490LhVJYzplNTGL'} 
                alt="Logo" 
                className="w-full h-full object-contain animate-fadeIn"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-light text-sm tracking-widest text-white leading-tight">
                BOTANICAL
              </span>
              <span className="text-[7px] tracking-[0.2em] text-gold-accent font-semibold leading-none">
                LIVING & STAYS
              </span>
            </div>
          </div>

          {/* Close button inside sidebar on mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors outline-none ${isActive ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="mr-3" size={20} />
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-forest/50">
          <button 
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors text-white/80 hover:bg-red-500/20 hover:text-red-300 outline-none" 
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="mr-3" size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 max-w-full">
        {/* Top bar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-dark-forest hover:bg-stone-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <AdminGlobalSearch />
            <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm shrink-0">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow relative p-2 sm:p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

