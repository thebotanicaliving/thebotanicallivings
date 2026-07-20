import { Routes } from './routes';

export const MainNavigation = [
  { label: 'Home', path: Routes.home },
  { label: 'Rooms', path: Routes.rooms },
  { label: 'Booking', path: Routes.booking },
  { label: 'Gallery', path: Routes.gallery },
  { label: 'Journal', path: Routes.blog },
] as const;

export const FooterNavigation = {
  discover: [
    { label: 'Luxury Stays', path: Routes.rooms },
    { label: 'Virtual Experiences', path: Routes.virtualTour },
    { label: 'Journal', path: Routes.blog },
    { label: 'Gallery', path: Routes.gallery },
  ],
  support: [
    { label: 'Book Now', path: Routes.booking },
    { label: 'Get in Touch', path: Routes.getInTouch },
    { label: 'Privacy Policy', path: Routes.privacyPolicy },
    { label: 'Terms & Conditions', path: Routes.terms },
  ],
} as const;
