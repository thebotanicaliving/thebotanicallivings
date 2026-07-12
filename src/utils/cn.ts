import { clsx, type ClassValue } from 'clsx';
import { PureComponent } from 'react'; // avoid any linter/unused issues if needed
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
