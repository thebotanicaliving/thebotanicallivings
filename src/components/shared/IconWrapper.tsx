import { Icons } from '@/constants/icons';
import { cn } from '@/utils/cn';

interface IconWrapperProps {
  name: keyof typeof Icons;
  className?: string;
  size?: number;
  id?: string;
}

export function IconWrapper({ name, className, size = 20, id }: IconWrapperProps) {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in constants/icons.ts`);
    return null;
  }
  
  return (
    <IconComponent
      id={id}
      className={cn('inline-block text-current', className)}
      size={size}
    />
  );
}
