import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { MainNavigation } from '@/constants/navigation';
import { useSettings } from '@/hooks/useSettings';
import { Assets } from '@/constants/assets';
import { Button } from '@/components/shared/Button';
import { IconWrapper } from '@/components/shared/IconWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { getDirectMediaUrl } from '@/utils/media';

export function Navbar() {
  const { settings } = useSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Control solid background
      if (currentScrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const showSolidNavbar = isScrolled || isMobileMenuOpen || !isHomePage;
  const shouldBeVisible = isVisible || isMobileMenuOpen;

  return (
    <>
      <header
        id="app-navbar"
        className={cn(
          'fixed top-0 left-0 right-0 h-14 md:h-16 flex items-center transition-all duration-300 ease-in-out border-b',
          isMobileMenuOpen ? 'z-[100001]' : 'z-[999]',
          shouldBeVisible ? 'translate-y-0' : '-translate-y-full shadow-none',
          showSolidNavbar
            ? 'bg-warm-cream/80 backdrop-blur-md border-border/30 shadow-sm text-text-primary'
            : 'bg-transparent border-transparent text-warm-cream'
        )}
      >
        <div className="w-full max-w-[1300px] mx-auto px-5 md:px-8 xl:px-12 flex items-center justify-between">
          {/* Brand Logo - left aligned */}
          <Link
            to="/"
            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity duration-200"
          >
            {/* Logo Icon */}
            <img
              src={getDirectMediaUrl(settings?.logoUrl) || Assets.logos.icon}
              alt=""
              referrerPolicy="no-referrer"
              className={cn(
                "h-8 md:h-9 w-auto object-contain transition-all duration-300",
                settings?.logoUrl ? "" : (showSolidNavbar ? "brightness-0" : "brightness-0 invert")
              )}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Wordmark */}
            <img
              src={getDirectMediaUrl(settings?.wordmarkUrl) || Assets.logos.wordmark}
              alt={(settings?.hotelName || "Botanical Living")}
              referrerPolicy="no-referrer"
              className={cn(
                "h-5 md:h-6 w-auto object-contain transition-all duration-300",
                settings?.wordmarkUrl ? "" : (showSolidNavbar ? "brightness-0" : "brightness-0 invert")
              )}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fb = parent.querySelector('.text-fallback');
                  if (fb) fb.classList.remove('hidden');
                }
              }}
            />
            <span
              className={cn(
                'text-fallback font-heading text-xl md:text-2xl font-semibold tracking-wide hidden',
                showSolidNavbar ? 'text-primary-forest' : 'text-warm-cream'
              )}
            >
              {(settings?.hotelName || "Botanical Living")}
            </span>
          </Link>

          {/* Navigation - center aligned desktop */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10">
            {MainNavigation.map((item) => {
              const isActive = item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    'relative font-button text-sm tracking-widest font-medium py-1 transition-colors duration-250 cursor-pointer group',
                    isActive
                      ? (showSolidNavbar ? 'text-primary-forest font-semibold' : 'text-warm-cream font-semibold')
                      : (showSolidNavbar ? 'text-text-secondary hover:text-primary-forest' : 'text-stone hover:text-warm-cream')
                  )}
                >
                  {item.label}
                  <span className={cn(
                    'absolute bottom-0 left-0 h-0.5 bg-gold-accent transition-all duration-300',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  )} />
                </Link>
              );
            })}
          </nav>


          {/* CTA - right aligned desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant={showSolidNavbar ? 'primary' : 'outline'}
              size="sm"
              className={cn(
                'font-semibold normal-case gap-2 tracking-widest text-xs',
                !showSolidNavbar && 'text-warm-cream border-warm-cream/40 hover:bg-warm-cream/10'
              )}
              onClick={() => {
                const cleanedNumber = (settings?.whatsapp || "").replace(/[^0-9]/g, '');
                window.open(`https://wa.me/${cleanedNumber}`, '_blank', 'noopener,noreferrer');
              }}
            >

              Chat With Us
              <IconWrapper 
              name="whatsapp" 
              className="text-white fill-current ml-2" 
              size={18} 
              />
            </Button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'lg:hidden p-2 rounded-button focus:outline-none focus:ring-1 focus:ring-gold-accent transition-colors duration-250 cursor-pointer relative',
              isMobileMenuOpen ? 'z-[100002] text-text-primary' : '',
              showSolidNavbar ? 'text-text-primary hover:bg-stone/20' : 'text-warm-cream hover:bg-white/10'
            )}
            aria-label="Toggle navigation menu"
          >
            <IconWrapper name={isMobileMenuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation (Rendered OUTSIDE <header> to avoid backdrop-filter stacking context bugs) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[99999] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]"
            />

            {/* Side Drawer menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-warm-cream border-l border-border/50 z-[100000] flex flex-col justify-between p-6 pt-24 shadow-xl"
            >
              <div className="flex flex-col space-y-5">
                {MainNavigation.map((item, index) => {
                  const isActive = item.path === '/' 
                    ? location.pathname === '/' 
                    : location.pathname.startsWith(item.path);
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "font-button text-base tracking-widest py-2 transition-colors duration-250 border-b border-border/20 block w-full",
                          isActive 
                            ? "text-primary-forest font-bold" 
                            : "text-text-primary font-medium hover:text-primary-forest"
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col space-y-4">
                <Button
                  variant="primary"
                  className="w-full text-center tracking-widest uppercase text-xs py-3"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                >
                  Book Your Stay
                </Button>
                
                <div className="text-center text-xs text-text-secondary font-medium">
                  {(settings?.phone || "")}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
export default Navbar;
