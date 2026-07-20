import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { MainNavigation } from '@/constants/navigation';
import { Hotel } from '@/constants/hotel';
import { Assets } from '@/constants/assets';
import { Button } from '@/components/shared/Button';
import { IconWrapper } from '@/components/shared/IconWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
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
            className="flex items-center space-x-2 md:space-x-3 cursor-pointer hover:opacity-90 transition-opacity duration-200"
          >
            <div className="flex items-center space-x-2 md:space-x-3">
              <img 
                src={Assets.logos.icon} 
                alt="Botanical Living Icon" 
                className={cn(
                  "h-7 md:h-8 w-auto transition-all duration-300",
                  showSolidNavbar ? "brightness-0" : "brightness-0 invert"
                )}
              />
              <img 
                src={Assets.logos.wordmark} 
                alt="Botanical Living Wordmark Logo" 
                className={cn(
                  "h-5 md:h-6 w-auto transition-all duration-300",
                  showSolidNavbar ? "brightness-0" : "brightness-0 invert"
                )}
              />
            </div>
            <div className="flex flex-col ml-2 hidden">
              <span
                className={cn(
                  'font-heading text-base md:text-lg font-bold tracking-tight uppercase leading-none',
                  showSolidNavbar ? 'text-primary-forest' : 'text-warm-cream'
                )}
              >
                {Hotel.shortName}
              </span>
              <span className={cn(
                "text-[7px] md:text-[8px] tracking-[0.25em] uppercase font-bold",
                showSolidNavbar ? "text-gold-accent" : "text-gold-accent"
              )}>
                {Hotel.location.city}
              </span>
            </div>
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
                    'relative font-button text-[10px] tracking-widest font-semibold py-1 transition-colors duration-250 cursor-pointer group uppercase',
                    isActive
                      ? (showSolidNavbar ? 'text-primary-forest' : 'text-warm-cream')
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
                'font-bold uppercase gap-2 tracking-widest text-[10px] px-6',
                !showSolidNavbar && 'text-warm-cream border-warm-cream/40 hover:bg-warm-cream/10'
              )}
              onClick={() => {
                const cleanedNumber = Hotel.contact.whatsapp.replace(/[^0-9]/g, '');
                window.open(`https://wa.me/${cleanedNumber}`, '_blank', 'noopener,noreferrer');
              }}
            >
              Concierge
              <IconWrapper 
                name="whatsapp" 
                className="ml-1" 
                size={14} 
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

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[99999] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]"
            />

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
                          "font-button text-xs tracking-widest py-3 transition-colors duration-250 border-b border-border/10 block w-full uppercase font-bold",
                          isActive 
                            ? "text-primary-forest" 
                            : "text-text-primary hover:text-primary-forest"
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
                  className="w-full text-center tracking-widest uppercase text-[10px] font-bold py-4"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    const cleanedNumber = Hotel.contact.whatsapp.replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${cleanedNumber}`, '_blank', 'noopener,noreferrer');
                  }}
                >
                  Book Your Stay
                </Button>
                
                <div className="text-center text-[10px] text-text-secondary font-bold tracking-widest uppercase">
                  {Hotel.contact.phone}
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
