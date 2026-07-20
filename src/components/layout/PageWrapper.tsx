import { ReactNode, useEffect } from 'react';
import { motion } from 'motion/react';

interface PageWrapperProps {
  children: ReactNode;
  id?: string;
}

export function PageWrapper({ children, id }: PageWrapperProps) {
  // Page level scroll restoration to the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.main
      id={id || 'page-wrapper'}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full min-h-screen flex flex-col"
    >
      {children}
    </motion.main>
  );
}
export default PageWrapper;
