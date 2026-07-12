import { Links } from './links';

export const SocialLinks = [
  {
    name: 'Instagram',
    handle: '@botanical.living',
    url: Links.instagram,
    icon: 'Instagram',
  },
  {
    name: 'Facebook',
    handle: 'Botanical Living',
    url: Links.facebook,
    icon: 'Facebook',
  },
  {
    name: 'LinkedIn',
    handle: 'Botanical Living & Stays',
    url: Links.linkedin,
    icon: 'Linkedin',
  },
  {
    name: 'YouTube',
    handle: 'Botanical Living',
    url: Links.youtube,
    icon: 'Youtube',
  },
] as const;
