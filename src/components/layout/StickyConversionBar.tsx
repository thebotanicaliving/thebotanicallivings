import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Calendar, Home } from 'lucide-react';
import { Hotel } from '@/constants/hotel';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/utils/cn';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function StickyConversionBar() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappNumber = (settings?.whatsapp || Hotel.contact.whatsapp).replace(/\D/g, '');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:pb-6 pointer-events-none"
        >
          <div className="max-w-xl mx-auto w-full pointer-events-auto">
            <div className="bg-dark-forest/95 backdrop-blur-md border border-warm-cream/10 rounded-full shadow-2xl p-1.5 flex items-center justify-between gap-2 overflow-hidden">
              
              {/* Main CTA: Schedule Visit */}
              <Link
                to="/contact"
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full text-warm-cream hover:bg-warm-cream/10 transition-colors duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-gold-accent/20 flex items-center justify-center group-hover:bg-gold-accent/30 transition-colors">
                  <Calendar size={16} className="text-gold-accent" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold">Schedule Visit</span>
              </Link>

              {/* Primary Action: Book Room */}
              <Link
                to="/rooms"
                className="flex-[1.2] relative flex items-center justify-center gap-2 h-12 rounded-full bg-gold-accent text-dark-forest font-bold uppercase tracking-widest text-[10px] transition-all duration-300 shadow-lg px-4 overflow-hidden group"
              >
                {/* Subtle sheen animation */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                  animate={{ translateX: ['100%', '-100%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear', repeatDelay: 3 }}
                />
                
                <Home size={16} className="group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Book Room Now</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StickyConversionBar;
