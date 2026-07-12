import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { IconWrapper } from './IconWrapper';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("w-full max-w-[1300px] mx-auto px-5 md:px-8 xl:px-12 py-4 flex items-center text-[11px] font-sans tracking-widest uppercase text-text-secondary/60", className)}
    >
      <ol className="flex flex-wrap items-center space-x-2.5">
        {/* Home Link */}
        <li className="flex items-center">
          <Link 
            to="/" 
            className="hover:text-primary-forest transition-colors duration-300 flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-primary-forest/20 rounded px-1"
          >
            <IconWrapper name="home" size={11} className="opacity-80" />
            <span>Home</span>
          </Link>
        </li>

        {/* Dynamic Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center space-x-2.5">
              {/* Chevron Separator */}
              <span className="text-stone/40 pointer-events-none select-none">
                <IconWrapper name="chevronRight" size={10} />
              </span>

              {isLast || !item.href ? (
                <span 
                  className="text-primary-forest font-semibold truncate max-w-[180px] sm:max-w-[280px] md:max-w-[360px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="hover:text-primary-forest transition-colors duration-300 truncate max-w-[150px] sm:max-w-[220px] focus:outline-none focus:ring-1 focus:ring-primary-forest/20 rounded px-1"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
