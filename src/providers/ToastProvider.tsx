import { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconWrapper } from '@/components/shared/IconWrapper';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-toast flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const colors = {
              success: 'bg-[#EAF3EE] border-[#B7DBC7] text-[#1F4D3B]',
              error: 'bg-[#FDF2F2] border-[#F8B4B4] text-[#9B1C1C]',
              info: 'bg-[#F2F6FC] border-[#D0E1FD] text-[#1E429F]',
            };

            const icons = {
              success: 'check' as const,
              error: 'alert' as const,
              info: 'compass' as const,
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`flex items-start p-4 rounded-button border shadow-sm pointer-events-auto ${colors[toast.type]}`}
              >
                <span className="flex-shrink-0 mt-0.5 mr-3">
                  <IconWrapper name={icons[toast.type]} size={18} />
                </span>
                <p className="font-sans text-sm font-medium leading-relaxed">
                  {toast.message}
                </p>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="ml-auto pl-3 text-current/60 hover:text-current focus:outline-none cursor-pointer"
                >
                  <IconWrapper name="close" size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
