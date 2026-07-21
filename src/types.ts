export interface HotelLocation {
  landmark: string;
  locality: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  googleMaps: string;
  fullAddress: string;
}

export interface HotelContact {
  phone: string;
  whatsapp: string;
  website: string;
}

export interface HotelAccommodation {
  roomTypes: string[];
  pricing: {
    singleSharing: string;
    twoSharing: string;
  };
}

export interface HotelCafe {
  name: string;
  highlights: string[];
}

export interface HotelConfig {
  name: string;
  shortName: string;
  tagline: string;
  slogan: string;
  description: string;
  location: HotelLocation;
  contact: HotelContact;
  accommodation: HotelAccommodation;
  amenities: string[];
  services: string[];
  cafe: HotelCafe;
  logoUrl?: string;
  virtualTourUrl?: string;
}

export interface Room {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  gallery: string[];
  totalRooms?: number;
  physicalRooms?: { number: string; floor: string }[];
  
  // Phase 2 legacy fields
  occupancy: number | string;
  maxCapacity?: number;
  currentResidents?: number;
  pricing?: string;
  availabilityId?: string;

  // Phase 3 required fields
  shortDescription?: string;
  price?: string;
  priceSuffix?: string;
  roomSize?: string;
  
  amenities: string[];
  services: string[];
  featured: boolean;
  published?: boolean;
  displayOrder: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export type AvailabilityStatus = 'Available' | 'Limited' | 'Sold Out';

export interface RoomAvailability {
  roomId: string;
  status: AvailabilityStatus;
  availableRooms: number;
  totalRooms: number;
  lastUpdated: string;
}

export interface BlogSection {
  id: string;
  type: 'text' | 'image' | 'text-image' | 'quote';
  title?: string;
  content?: string;
  imageUrl?: string;
  imageCaption?: string;
  imageLayout?: 'left' | 'right' | 'full' | 'grid-two';
  imageUrlSecond?: string;
  imageCaptionSecond?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // supports markdown fallback
  sections?: BlogSection[]; // rich section-wise layout
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  published: boolean;
  featured: boolean;
  readingTime: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id?: string;
  imageUrl: string;
  title?: string;
  caption?: string;
  description?: string;
  category: string;
  featured?: boolean;
  displayOrder?: number;
  published?: boolean;
  type?: 'image' | 'video';
}

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  published?: boolean;
}

export interface ReviewItem {
  id?: string;
  name: string;
  role: string;
  stayType: string;
  quote: string;
  rating: number;
  date: string;
  initials: string;
  displayOrder: number;
  published?: boolean;
}

export interface BookingRequest {
  id?: string;
  bookingRef?: string;
  roomId: string;
  roomTitle: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfNights: number;
  guestsCount: number;
  adultsCount: number;
  childrenCount: number;
  
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  notes?: string;
  aadhaarNumber?: string;
  permanentAddress?: string;

  // Legacy fields for backward compatibility and search/contact pages
  name?: string;
  roomName?: string;
  moveInDate?: string;
  duration?: string;
  message?: string;
  roomType?: string;

  // Pricing breakdown
  baseAmount: number;
  extraGuestsAmount: number;
  foodAmount: number;
  selectedFoodOptions?: string[];
  taxesAmount: number;
  cleaningFee: number;
  platformFee: number;
  securityDeposit: number;
  discountAmount: number;
  grandTotal: number;
  advanceAmount: number;

  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  status: 'pending' | 'payment_pending' | 'paid' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled' | 'refunded' | 'rejected' | 'archived';
  createdAt: string;
  updatedAt: string;
  
  paymentDetails?: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    paidAt?: string;
  };
}

export interface Payment {
  id?: string;
  bookingId: string;
  bookingRef: string;
  paymentId: string;
  orderId: string;
  signature: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  timestamp: string;
}

export interface BlockedDate {
  id?: string;
  roomId: string;
  roomTitle: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: 'Maintenance' | 'Private Use' | 'Cleaning' | 'VIP Reservation';
  notes: string;
  createdAt: string;
}

export interface PricingRules {
  id?: string;
  roomId: string; // or 'global'
  basePrice: number;
  weekendPrice: number;
  holidayPrice: number;
  extraAdultPrice: number;
  extraChildPrice: number;
  discountPercent: number;
  taxesPercent: number;
  cleaningFee: number;
  platformFee: number;
  securityDeposit: number;
  advancePercent: number; // e.g., 50 for 50% advance
  minimumStay: number; // in nights
  maximumStay: number; // in nights
  cancellationWindow: number; // in hours
  refundRules: string;
}

export interface BookingHistory {
  id?: string;
  bookingId: string;
  bookingRef: string;
  action: string;
  performedBy: 'customer' | 'admin';
  notes: string;
  timestamp: string;
}

export interface ContactRequest {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'archived';
  createdAt: string;
}
