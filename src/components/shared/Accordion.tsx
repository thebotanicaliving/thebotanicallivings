import { useState } from 'react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'motion/react';
import { IconWrapper } from './IconWrapper';

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: readonly AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="relative group transition-all duration-300"
          >
            {/* Classy Tapered Divider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[80%] h-[1px] bg-gradient-to-r from-transparent via-border/40 to-transparent group-first:hidden" />
            
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between py-3 text-left font-button font-medium text-text-primary hover:text-primary-forest focus:outline-none transition-colors duration-250 cursor-pointer"
            >
              <span className="text-base md:text-lg tracking-wide">{item.question}</span>
              <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-full border border-border/80 text-text-secondary hover:text-primary-forest">
                <IconWrapper
                  name="chevronDown"
                  size={14}
                  className={cn(
                    'transition-transform duration-300 ease-in-out',
                    isOpen && 'rotate-180 text-gold-accent'
                  )}
                />
              </span>
            </button>
            
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-sm md:text-base leading-relaxed text-text-secondary pr-6 max-w-[70ch]">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
