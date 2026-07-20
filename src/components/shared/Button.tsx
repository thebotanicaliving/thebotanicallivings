import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  iconLeft,
  iconRight,
  disabled,
  id,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-button font-medium rounded-button transition-all duration-250 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-accent focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-primary-forest text-warm-cream hover:bg-dark-forest shadow-subtle',
    secondary: 'bg-gold-accent text-dark-forest hover:bg-[#B3904B] shadow-subtle',
    outline: 'border border-border text-text-primary hover:bg-muted-bg hover:border-text-secondary bg-transparent',
    ghost: 'text-text-primary hover:bg-muted-bg hover:text-primary-forest bg-transparent',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs md:text-sm tracking-wide',
    md: 'px-6 py-3 text-sm md:text-base tracking-wide',
    lg: 'px-8 py-4 text-base md:text-lg tracking-wide',
    icon: 'p-3 aspect-square rounded-full',
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <span className="mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : iconLeft ? (
        <span className="mr-2 inline-flex items-center">{iconLeft}</span>
      ) : null}
      
      {children}
      
      {!loading && iconRight && (
        <span className="ml-2 inline-flex items-center">{iconRight}</span>
      )}
    </button>
  );
}
export default Button;
