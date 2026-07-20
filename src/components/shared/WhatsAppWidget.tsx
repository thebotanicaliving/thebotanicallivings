import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '@/hooks/useSettings';
import { IconWrapper } from './IconWrapper';

export function WhatsAppWidget() {
    const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cleanNumber = (settings?.whatsapp || "").replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanNumber}`;

  // Intersection Observer to hide widget inside Hero and Footer sections
  useEffect(() => {
    const heroEl = document.getElementById('hero-section');
    const footerEl = document.getElementById('app-footer');

    let isHeroVisible = false;
    let isFooterVisible = false;

    const updateVisibility = () => {
      // Hide if hero is visible OR footer is visible
      setIsVisible(!isHeroVisible && !isFooterVisible);
    };

    const observerOptions = {
      root: null,
      rootMargin: '-50px 0px', // slightly offset trigger to make entry feel natural
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target.id === 'hero-section') {
          isHeroVisible = entry.isIntersecting;
        } else if (entry.target.id === 'app-footer') {
          isFooterVisible = entry.isIntersecting;
        }
      });
      updateVisibility();
    }, observerOptions);

    if (heroEl) observer.observe(heroEl);
    if (footerEl) observer.observe(footerEl);

    // Initial state setup
    updateVisibility();

    // Scroll listener for visibility and scrolling away to auto-close
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      
      const inHero = scrollY < viewportHeight - 100;
      const inFooter = (totalHeight - scrollY - viewportHeight) < 400;

      setIsVisible(!inHero && !inFooter);

      // Auto close chatbot if scrolled away more than 80px
      if (Math.abs(scrollY - lastScrollY) > 80) {
        setIsOpen(false);
        lastScrollY = scrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Click outside listener to auto-close chatbot panel when clicked away
    const handleClickOutside = (event: MouseEvent) => {
      const widget = document.getElementById('whatsapp-widget');
      if (widget && !widget.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (heroEl) observer.unobserve(heroEl);
      if (footerEl) observer.unobserve(footerEl);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="whatsapp-widget"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[99998] flex flex-col items-end"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Floating Widget Popup Panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mb-4 w-80 bg-[#FCFAF6] border border-[#E5E0D5] rounded-card shadow-xl overflow-hidden text-left"
              >
                {/* Header: Deep forest green + Gold Typography */}
                <div className="bg-dark-forest text-warm-cream p-5 flex items-center justify-between border-b border-primary-forest/30">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-primary-forest/40 flex items-center justify-center border border-gold-accent/20 relative">
                      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-gold-accent rounded-full border border-dark-forest animate-pulse" />
                      <IconWrapper name="whatsapp" className="text-gold-accent" size={18} />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-medium tracking-wide text-warm-cream">Botanical Concierge</h4>
                      <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-stone/70 font-medium">Online • Operational 24/7</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full text-warm-cream/60 hover:text-warm-cream hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label="Close message popup"
                  >
                    <IconWrapper name="close" size={14} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  <div className="space-y-3">
                    <span className="font-button text-[9px] font-bold tracking-widest text-gold-accent uppercase block">
                      Priority Reservations
                    </span>
                    <p className="font-sans text-xs leading-relaxed text-text-primary">
                      Greetings! Thank you for choosing Botanical Living. 🌱
                    </p>
                    <p className="font-sans text-xs leading-relaxed text-text-secondary">
                      Whether you are curious about room availability, co-living pricing structures on Botanical Garden Road, or wish to schedule a private walkthrough, our concierge is here to assist.
                    </p>
                  </div>
                  
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center space-x-2.5 w-full py-4 bg-dark-forest hover:bg-primary-forest text-warm-cream border border-gold-accent/30 font-button text-xs font-semibold tracking-widest uppercase rounded-button shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <IconWrapper name="whatsapp" className="text-gold-accent" size={14} />
                    <span>Inquire via WhatsApp</span>
                  </a>

                  <p className="font-sans text-[9px] text-text-secondary/50 text-center italic">
                    Typical desk reply time: Under 10 minutes.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Floating Trigger Button (Luxury Dark/Gold Style) */}
          <div className="flex items-center space-x-3">
            {/* Elegant text tag appearing on hover */}
            <AnimatePresence>
              {isHovered && !isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-dark-forest/90 backdrop-blur-md text-warm-cream text-[10px] tracking-widest font-button uppercase py-2 px-4 rounded-full shadow-md border border-gold-accent/20 hidden md:block"
                >
                  Concierge Desk
                </motion.span>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full bg-dark-forest text-warm-cream flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-gold-accent/40 relative cursor-pointer"
              aria-label="Contact reservations on WhatsApp"
            >
              <span className="absolute top-1 right-1 w-3 h-3 bg-gold-accent border-2 border-dark-forest rounded-full" />
              <IconWrapper name="whatsapp" className="w-6 h-6 text-gold-accent" size={24} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default WhatsAppWidget;
