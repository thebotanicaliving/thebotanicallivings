import { Hotel } from './hotel';

// Convert raw phone/whatsapp to clean URL formats safely
const cleanWhatsAppNumber = Hotel.contact.whatsapp.replace(/[^0-9]/g, '');

export const Links = {
  instagram: 'https://instagram.com/botanical_living',
  facebook: 'https://facebook.com/botanical_living',
  linkedin: 'https://linkedin.com/company/botanical-living',
  youtube: 'https://youtube.com/c/botanical-living',
  whatsapp: `https://wa.me/${cleanWhatsAppNumber}`,
  googleMaps: 'https://share.google/pl0FkSluXcAVQ7tOG',
  googleReviews: 'https://g.page/botanical-living/review',
  bookingEngine: `https://${Hotel.contact.website}`,
  privacyPolicy: '/privacy-policy',
  terms: '/terms-and-conditions',
  razorpay: 'https://razorpay.com',
} as const;
