import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { roomService } from '@/services/room.service';
import { Room } from '@/types';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/shared';
import { MapPin, Compass, ShieldCheck, Heart, Sparkles, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

// Rich location and page-specific content mapping for premium SEO landing pages
interface SeoPageContent {
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  metaDescription: string;
  keywords: string[];
  proximityTitle: string;
  proximityItems: { place: string; detail: string }[];
  faqs: { q: string; a: string }[];
}

const SEO_PAGES: Record<string, SeoPageContent> = {
  'coliving-in-kondapur': {
    slug: 'coliving-in-kondapur',
    title: 'Premium Coliving in Kondapur, Hyderabad',
    subtitle: 'Bespoke eco-luxury co-living spaces designed for modern minds and conscious living.',
    intro: 'Botanical Living & Stays introduces a new standard of co-living in Kondapur. Nestled in a serene neighborhood yet minutes away from the buzzing IT hubs, our premium residence bridges the gap between biological architectural elegance and high-end urban comfort. Perfect for remote innovators and corporate leaders.',
    metaDescription: 'Discover the absolute finest premium coliving in Kondapur, Hyderabad. Botanical Living & Stays offers fully managed luxury single and twin sharing suites with gourmet organic dining, rooftop cafe, and executive workspaces.',
    keywords: ['coliving in kondapur', 'luxury pg in kondapur', 'premium coliving hyderabad', 'hostels in kondapur'],
    proximityTitle: 'Kondapur Connectivity & Tech Proximity',
    proximityItems: [
      { place: 'Mindspace IT Park', detail: '8 mins (2.4 km)' },
      { place: 'DLF Cyber City', detail: '10 mins (3.1 km)' },
      { place: 'Chirec International School', detail: '3 mins (0.9 km)' },
      { place: 'Kondapur Botanical Garden', detail: '4 mins (1.2 km)' }
    ],
    faqs: [
      {
        q: 'Why choose Botanical Living over a standard PG in Kondapur?',
        a: 'Unlike traditional PGs, Botanical Living offers an eco-luxury hospitality experience. We combine organic farm-to-table dining, professional-grade executive workspaces, premium air-conditioned suites with orthopaedic bedding, and custom biophilic architecture designed to reduce mental stress and enhance productivity.'
      },
      {
        q: 'What amenities are included in the monthly stay package?',
        a: 'The package includes unlimited premium high-speed fiber Wi-Fi, professional daily housekeeping, en-suite private bathrooms, full access to executive workspaces, rooftop botanical cafe access, laundry services, 3-tier security, and gourmet organic vegetarian meals.'
      },
      {
        q: 'How close is the property to major tech parks in Kondapur?',
        a: 'Our property is strategically situated within 5 to 10 minutes of primary corporate centers including Google, DLF Cyber City, Mindspace IT Park, and Cyber Towers, making your daily commute absolutely effortless.'
      },
      {
        q: 'Are visitors and overnight guests allowed?',
        a: 'Yes, daytime visitors are warmly welcome in our communal areas, rooftop cafe, and lobby. Overnight guests are permitted with advance registration through our digital concierge app to maintain the comfort and security of all residents.'
      }
    ]
  },
  'coliving-near-financial-district': {
    slug: 'coliving-near-financial-district',
    title: 'Luxury Coliving Near Financial District',
    subtitle: 'A calm, stress-free sanctuary for financial and tech leaders near Hyderabad\'s primary finance hub.',
    intro: 'Simplify your commute and elevate your day-to-day lifestyle. Located in direct proximity to the Nanakramguda Financial District, Botanical Living & Stays offers exquisite, fully managed coliving suites styled with natural materials, biophilic layouts, and ultra-high-speed connectivity for absolute focus.',
    metaDescription: 'Luxury coliving near Financial District Nanakramguda. Managed premium suites with organic meals, robust WiFi, and high-contrast designer layouts near Wipro Circle and Gachibowli.',
    keywords: ['coliving near financial district', 'pg near nanakramguda', 'luxury coliving gachibowli', 'accommodation near wipro circle'],
    proximityTitle: 'Financial District Proximity Matrix',
    proximityItems: [
      { place: 'Financial District (Nanakramguda)', detail: '12 mins (5.2 km)' },
      { place: 'Wipro Circle', detail: '11 mins (4.8 km)' },
      { place: 'Gachibowli Stadium', detail: '7 mins (2.9 km)' },
      { place: 'IKEA & Mindspace', detail: '10 mins (4.2 km)' }
    ],
    faqs: [
      {
        q: 'How convenient is the commute to the Financial District?',
        a: 'Botanical Living offers a seamless commute. Located just off the main arterial corridors, residents can reach Wipro Circle, Microsoft, ICICI Towers, and other Financial District landmarks in under 12 minutes via direct access roads.'
      },
      {
        q: 'Is there a dedicated space for remote working or video calls?',
        a: 'Absolutely. We feature bespoke, high-contrast workspace zones equipped with ergonomic seating, silent zones, high-speed backup internet, and power sockets to support professionals working with international global clients.'
      },
      {
        q: 'What security standards are maintained at the property?',
        a: 'We implement rigorous 3-tier safety standards: 24/7 manned security, smart biometric/RFID entry access, high-definition CCTV coverage in communal spaces, and dedicated digital concierge check-ins.'
      },
      {
        q: 'Is organic dining provided for late-night corporate shifts?',
        a: 'Yes, our on-site culinary team prepares healthy organic meals. Dinner is served during flexible hours, and our micro-pantry facilities remain stocked with nutritious snacks, green teas, and organic coffee for professionals on nocturnal schedules.'
      }
    ]
  },
  'coliving-near-gachibowli': {
    slug: 'coliving-near-gachibowli',
    title: 'Managed Coliving Near Gachibowli',
    subtitle: 'Eco-conscious living spaces connecting you seamlessly to Gachibowli\'s prominent tech corridors.',
    intro: 'Experience a harmonious balance of personal wellness and professional productivity. Located adjacent to the Gachibowli growth corridor, our residence features meticulously detailed shared suites, organic dining options, and a thriving community of conscious modern creators.',
    metaDescription: 'Managed luxury coliving near Gachibowli, Hyderabad. Premium residential suites with attached bath, organic meals, power backup, and close proximity to IIIT and DLF Cyber City.',
    keywords: ['coliving near gachibowli', 'pg in gachibowli', 'luxury hostels gachibowli', 'single sharing gachibowli'],
    proximityTitle: 'Gachibowli Proximity & Travel Times',
    proximityItems: [
      { place: 'Gachibowli Junction', detail: '6 mins (2.2 km)' },
      { place: 'IIIT Hyderabad Campus', detail: '5 mins (1.8 km)' },
      { place: 'DLF Cyber City', detail: '8 mins (2.8 km)' },
      { place: 'Continental Hospitals', detail: '12 mins (5.5 km)' }
    ],
    faqs: [
      {
        q: 'What sharing options are available near Gachibowli?',
        a: 'We offer two meticulously configured options: Ultra-private Single Sharing Suites for individuals wanting undisturbed focus, and Premium Twin Sharing Suites featuring individual workspaces and independent wardrobes.'
      },
      {
        q: 'Does Gachibowli property have recreational spaces?',
        a: 'Yes, Botanical Living features a stunning, biophilic rooftop terrace garden, an intimate library zone, a organic dining hall, and curated weekend wellness and yoga programs for natural rejuvenation.'
      },
      {
        q: 'Is power backup and high-speed internet reliable?',
        a: 'Yes. We guarantee 100% power backup for air conditioning and workspaces, along with dual-active high-speed fiber broadband connections to ensure you never experience downtime.'
      },
      {
        q: 'Can I book a physical or virtual property tour before booking?',
        a: 'Certainly! We offer live guided video walkthroughs as well as an interactive 3D virtual tour directly on our digital portal to let you experience the space prior to securing your reservation.'
      }
    ]
  },
  'coliving-near-hitech-city': {
    slug: 'coliving-near-hitech-city',
    title: 'Sophisticated Coliving Near Hitech City',
    subtitle: 'Premium residential suites designed for tech innovators, developers, and entrepreneurs.',
    intro: 'Step into an oasis of natural light, sophisticated architecture, and organic energy. Strategically positioned for minimal travel time to Hitech City, Botanical Living & Stays offers fully-furnished premium spaces with private work desks, a rooftop botanical cafe, and daily maintenance services.',
    metaDescription: 'Sophisticated eco-luxury coliving near Hitech City, Hyderabad. Fully-managed serviced rooms featuring organic interiors, modern fitness spaces, and workspaces near Cyber Towers.',
    keywords: ['coliving near hitech city', 'luxury pg hitech city', 'cyber towers pg', 'executive hostel hitech city'],
    proximityTitle: 'Hitech City Corridor Access',
    proximityItems: [
      { place: 'Cyber Towers (Hitech City)', detail: '7 mins (2.5 km)' },
      { place: 'Mindspace IT Park', detail: '8 mins (2.4 km)' },
      { place: 'Shilparamam Craft Village', detail: '6 mins (2.0 km)' },
      { place: 'Inorbit Mall & Lake', detail: '9 mins (3.5 km)' }
    ],
    faqs: [
      {
        q: 'What makes this property ideal for tech professionals?',
        a: 'We design for the digital life: ergonomic workstations in every room, zero-latency Wi-Fi, fully sound-insulated windows, premium climate control, and direct adjacency to transit lines heading to Hitech City and Cyber Towers.'
      },
      {
        q: 'Is laundry and ironing managed on-site?',
        a: 'Yes, professional laundry and dry-cleaning options are managed internally. Daily housekeeping keeps your room immaculate, while fresh linen and towels are rotated weekly.'
      },
      {
        q: 'Are meals customizable for health or fitness goals?',
        a: 'Our menu is prepared using fresh, organic ingredients. We offer highly nutritious vegetarian options focused on balanced diets, low-oil prep, and macro-rich foods to keep you energized and healthy.'
      },
      {
        q: 'Is there a lock-in period for reservations?',
        a: 'We offer highly flexible rental timelines ranging from convenient monthly extensions to stable long-term annual agreements, with straightforward refundable security policies.'
      }
    ]
  },
  'premium-coliving-hyderabad': {
    slug: 'premium-coliving-hyderabad',
    title: 'Premium Coliving in Hyderabad',
    subtitle: 'Redefining shared residential luxury with biological architecture and premium hospitality.',
    intro: 'For those who refuse to settle for the average. Botanical Living & Stays is Hyderabad\'s premier eco-luxury destination, bringing together the absolute finest of five-star hospitality services, stunning botanical design language, and premium single or twin-sharing suites in the heart of Cyberabad.',
    metaDescription: 'Experience the absolute pinnacle of premium coliving in Hyderabad. Serviced boutique suites featuring biophilic layouts, executive work lounges, and chef-curated dining.',
    keywords: ['premium coliving hyderabad', 'luxury coliving hyderabad', 'best pg in hyderabad', 'premium serviced stays'],
    proximityTitle: 'Centrally Located in Cyberabad',
    proximityItems: [
      { place: 'Hitech City IT Corridor', detail: '7 mins (2.5 km)' },
      { place: 'Gachibowli Junction', detail: '6 mins (2.2 km)' },
      { place: 'Financial District', detail: '12 mins (5.2 km)' },
      { place: 'RGIA International Airport', detail: '35 mins (32 km)' }
    ],
    faqs: [
      {
        q: 'What is the philosophy behind the "Botanical" design?',
        a: 'We believe environments shape minds. We integrate native plants, organic air filtration, timber finishes, calming pastel-earth color palettes, and expansive layouts to create a biological sanctuary that actively relieves urban fatigue.'
      },
      {
        q: 'How does the booking and onboarding process work?',
        a: 'Booking is completely digital. Simply check real-time availability on our portal, select your desired room, complete the identity verification, make your online payment, and check-in smoothly on your selected date.'
      },
      {
        q: 'Are medical facilities easily accessible from the property?',
        a: 'Yes, we are situated within immediate reach of top-tier multi-specialty hospitals including KIMS Kondapur and Continental Hospitals, with emergency response protocols always active.'
      },
      {
        q: 'Is there car or bike parking available?',
        a: 'Yes, the property features a dedicated multi-level parking zone with active camera monitoring, security guards, and modern electric vehicle (EV) charging facilities.'
      }
    ]
  },
  'fully-furnished-rooms-kondapur': {
    slug: 'fully-furnished-rooms-kondapur',
    title: 'Fully Furnished Rooms in Kondapur',
    subtitle: 'Move-in ready designer suites with premium organic interiors and top-tier amenities.',
    intro: 'Skip the stress of furnishing a house. Our fully furnished suites in Kondapur come equipped with custom solid wood wardrobes, premium ergonomic workstations, luxury orthopaedic bedding, smart climate control, and attached high-end en-suite bathrooms.',
    metaDescription: 'Fully furnished rooms for rent in Kondapur, Hyderabad. Move-in ready executive coliving rooms with private work desks, AC, attached bathrooms, and gourmet meals.',
    keywords: ['fully furnished rooms kondapur', 'furnished flat rent kondapur', 'room rent in kondapur', 'serviced rooms kondapur'],
    proximityTitle: 'Lifestyle & Leisure Proximity',
    proximityItems: [
      { place: 'Sarath City Capital Mall / AMB', detail: '5 mins (1.5 km)' },
      { place: 'Kondapur Botanical Garden', detail: '3 mins (1.0 km)' },
      { place: 'DLF Cyber City', detail: '10 mins (3.1 km)' },
      { place: 'KIMS Hospital Kondapur', detail: '4 mins (1.1 km)' }
    ],
    faqs: [
      {
        q: 'What furniture and electronic appliances are provided in the room?',
        a: 'Every suite is equipped with a premium silent split air-conditioner, en-suite smart water heater, personal mini-refrigerator, robust wooden study table with ergonomic chair, custom orthopedic mattress, LED smart television, and spacious wardrobes.'
      },
      {
        q: 'Are kitchen utilities and meals fully handled?',
        a: 'Yes, we provide dynamic organic farm-to-table vegetarian meals prepared by our in-house chefs. Additionally, residents have access to our community pantry containing a microwave, water dispensers, and induction plates for light self-cooking.'
      },
      {
        q: 'How is maintenance and repair handled?',
        a: 'All maintenance is managed in-house. Any issues can be reported via our resident support dashboard, and our professional technician team resolves requests within a 24-hour window.'
      },
      {
        q: 'Do you charge a security deposit?',
        a: 'We require a highly competitive and fully refundable security deposit of only 1 or 2 months, with absolute transparency and no hidden deductions upon vacate.'
      }
    ]
  },
  'single-sharing-rooms-kondapur': {
    slug: 'single-sharing-rooms-kondapur',
    title: 'Single Sharing Rooms in Kondapur',
    subtitle: 'Exclusive private suites with professional workspaces and luxury en-suite facilities.',
    intro: 'Indulge in the ultimate luxury of absolute privacy. Our single-sharing rooms in Kondapur are designed specifically for individuals who appreciate peace, productivity, and a highly aesthetic living environment. Complete with premium housekeeping, professional workstations, and elegant bathrooms.',
    metaDescription: 'Single sharing coliving rooms in Kondapur. Private executive PG suites with AC, en-suite bathrooms, high-speed WiFi, organic meals, and absolute quietude.',
    keywords: ['single sharing rooms kondapur', 'private room kondapur pg', 'single occupancy pg kondapur', 'luxury single pg hyderabad'],
    proximityTitle: 'Business & IT Corridor Connections',
    proximityItems: [
      { place: 'Mindspace IT Park', detail: '8 mins (2.4 km)' },
      { place: 'Cyber Towers', detail: '7 mins (2.5 km)' },
      { place: 'DLF Cyber City', detail: '10 mins (3.1 km)' },
      { place: 'Gachibowli Junction', detail: '6 mins (2.2 km)' }
    ],
    faqs: [
      {
        q: 'Who are these single sharing rooms designed for?',
        a: 'These rooms are optimized for high-performing professionals, executive consultants, developers, and individuals who demand absolute privacy, silent studying or working areas, and premium room services.'
      },
      {
        q: 'Is there a private attached bathroom in all rooms?',
        a: 'Yes, 100% of our Single Sharing Suites feature high-end, meticulously clean private en-suite bathrooms styled with luxury fittings, hot water supply, and premium tile layouts.'
      },
      {
        q: 'Is daily cleaning included in the single-room rental?',
        a: 'Yes, our housekeeping team performs daily deep cleaning of your room, workstation, and en-suite bathroom to maintain pristine sanitation and comfort.'
      },
      {
        q: 'What is the booking security policy?',
        a: 'We offer simple online reservation. After checking real-time availability on our site, you can instantly secure your room by submitting a booking request and completing the secure advance payment.'
      }
    ]
  },
  'twin-sharing-rooms-kondapur': {
    slug: 'twin-sharing-rooms-kondapur',
    title: 'Twin Sharing Rooms in Kondapur',
    subtitle: 'Elegant shared suites designed with distinct personal boundaries and shared luxury.',
    intro: 'Luxury shared living, without a single compromise. Our exceptionally spacious twin-sharing rooms are carefully configured to offer distinct personal spaces: separate wooden wardrobes, independent ergonomic study desks, and high-quality premium shared lounge zones, backed by five-star managed hospitality.',
    metaDescription: 'Twin sharing coliving rooms in Kondapur. Spacious premium shared rooms with dual wardrobes, dual study tables, attached bath, AC, and organic meals.',
    keywords: ['twin sharing rooms kondapur', 'double sharing pg kondapur', 'shared room in kondapur', 'luxury double sharing hyderabad'],
    proximityTitle: 'Immediate Transit & Corporate Proximity',
    proximityItems: [
      { place: 'Mindspace IT Park', detail: '8 mins (2.4 km)' },
      { place: 'Cyber Towers Hitech City', detail: '7 mins (2.5 km)' },
      { place: 'Sarath City Capital Mall', detail: '5 mins (1.5 km)' },
      { place: 'Kondapur Botanical Garden', detail: '4 mins (1.2 km)' }
    ],
    faqs: [
      {
        q: 'How do you ensure privacy in a twin sharing room?',
        a: 'Our twin sharing rooms are uniquely designed with spatial segregation in mind. Residents are provided with completely independent study desks, separate deep-fitted wardrobes, and distinct bed positions separated by spacious floor plans.'
      },
      {
        q: 'Can I choose my roommate for the twin-sharing suite?',
        a: 'Absolutely! If you are moving in with a friend or colleague, we can co-allocate the suite for you. For individuals, we use a thoughtful profile compatibility system to pair you with a compatible co-resident.'
      },
      {
        q: 'Is the attached bathroom shared between the two roommates?',
        a: 'Yes, the high-end en-suite bathroom is private to the twin sharing suite and shared only between the two roommates residing in that specific suite.'
      },
      {
        q: 'What dynamic communal spaces are accessible to roommates?',
        a: 'Residents have full, unrestricted access to the executive study lounge, high-speed Wi-Fi, community dining room, and our beautiful rooftop botanical terrace with community seating.'
      }
    ]
  }
};

export function SeoLandingPage() {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Parse slug from either route parameters or direct path
  const slug = paramSlug || pathname.split('/').pop() || '';
  const content = SEO_PAGES[slug];

  useEffect(() => {
    if (!content) {
      navigate('/rooms', { replace: true });
      return;
    }

    // Dynamic document title & description updates for elite SEO performance
    document.title = `${content.title} | Botanical Living & Stays`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', content.metaDescription);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = content.metaDescription;
      document.head.appendChild(newMeta);
    }

    // Load available live rooms dynamically
    setLoadingRooms(true);
    roomService.getRooms()
      .then(fetched => {
        // filter published and order correctly
        const active = fetched.filter(r => r.published !== false);
        setRooms(active);
        setLoadingRooms(false);
      })
      .catch(err => {
        console.error('Error fetching rooms for SEO landing:', err);
        setLoadingRooms(false);
      });
  }, [slug, content, navigate]);

  if (!content) return null;

  return (
    <PageWrapper id={`seo-landing-${content.slug}`}>
      {/* 1. Cinematic Hero Section */}
      <section className="relative bg-dark-forest text-warm-cream pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Subtle background texture/overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-forest/30 via-dark-forest to-dark-forest opacity-80" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        
        <div className="relative max-w-[1200px] mx-auto px-5 md:px-8 xl:px-12 text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-forest/30 border border-primary-forest/50 rounded-full text-gold-accent text-xs font-button font-bold tracking-widest uppercase">
            <Sparkles size={12} />
            <span>Luxury Managed Accommodation</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {content.title}
          </h1>

          <p className="font-sans text-stone text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/booking">
              <Button variant="primary" className="px-8 py-4 text-sm font-semibold tracking-wider uppercase shadow-xl hover:shadow-2xl">
                Check Instant Availability
              </Button>
            </Link>
            <Link to="/rooms">
              <Button variant="outline" className="px-8 py-4 text-sm font-semibold tracking-wider uppercase border-white/20 text-white hover:bg-white/5">
                Explore All Suites
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Brand Value Proposition & Philosophy */}
      <section className="bg-stone-50 py-16 md:py-24 border-y border-stone-200/50">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 xl:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-forest/10 flex items-center justify-center text-primary-forest">
              <Compass size={24} />
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-light text-dark-forest tracking-tight">
              A biological sanctuary for the high-performing professional.
            </h2>
            <p className="font-sans text-stone-600 leading-relaxed text-base">
              {content.intro}
            </p>
            <p className="font-sans text-stone-500 leading-relaxed text-sm">
              Standard flat rentals force you to manage utility bills, erratic housekeepers, cooks, and poor internet. At Botanical Living, we completely strip away daily stress, providing an elite hotel-standard coliving experience tailored to modern work-life dynamics.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="text-teal-600 shrink-0 mt-0.5" size={18} />
                <span className="font-sans text-sm font-medium text-stone-700">Farm-to-Table Organic Meals</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="text-teal-600 shrink-0 mt-0.5" size={18} />
                <span className="font-sans text-sm font-medium text-stone-700">Dedicated Executive Desks</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="text-teal-600 shrink-0 mt-0.5" size={18} />
                <span className="font-sans text-sm font-medium text-stone-700">Zero-Latency Dual WiFi</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="text-teal-600 shrink-0 mt-0.5" size={18} />
                <span className="font-sans text-sm font-medium text-stone-700">Bespoke Rooftop Garden</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1522771731570-01020f5c010c?q=80&w=1200&auto=format&fit=crop" 
                alt="Bespoke luxury workspace and suites" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Ambient Badge */}
            <div className="absolute -bottom-6 -left-6 bg-dark-forest text-warm-cream p-5 rounded-2xl shadow-xl max-w-xs border border-primary-forest/30">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="text-gold-accent" size={24} />
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-gold-accent">5-Star Standards</h4>
                  <p className="text-[11px] text-stone/80 mt-0.5">Meticulous cleaning, chef-prepared dining, and smart access cards.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Proximity Matrix & Location Benefits */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="font-heading text-3xl font-light text-dark-forest tracking-tight">
              {content.proximityTitle}
            </h2>
            <p className="font-sans text-stone-500 text-sm leading-relaxed">
              Skip the long commutes. Our property layout and street access ensure you are fully connected to primary workspaces and leisure avenues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.proximityItems.map((item, index) => (
              <div 
                key={index}
                className="p-6 bg-stone-50 border border-stone-200/60 rounded-2xl flex flex-col justify-between hover:border-teal-600/30 hover:bg-stone-50/80 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                    <MapPin size={20} />
                  </div>
                  <h3 className="font-heading font-medium text-lg text-dark-forest">
                    {item.place}
                  </h3>
                </div>
                <div className="pt-6 border-t border-stone-200/50 mt-4 flex justify-between items-center text-xs font-mono text-stone-500">
                  <span>Drive Time:</span>
                  <span className="font-semibold text-teal-800 bg-teal-50/50 px-2 py-1 rounded">
                    {item.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Live Suites & Real Pricing */}
      <section className="bg-stone-50 py-16 md:py-24 border-t border-stone-200/50">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-widest font-bold text-teal-600 font-button">Available Formats</div>
              <h2 className="font-heading text-3xl font-light text-dark-forest tracking-tight">
                Luxury Residential Suites
              </h2>
            </div>
            <p className="font-sans text-stone-500 text-sm max-w-md">
              Live updates directly from our inventory. Choose the format that perfectly matches your lifestyle requirements.
            </p>
          </div>

          {loadingRooms ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-stone-400">Syncing live availability rates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rooms.map((room) => (
                <div 
                  key={room.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-100 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={room.coverImage} 
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-dark-forest font-sans">
                      {room.roomSize || '220 sq ft'}
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-heading text-2xl text-dark-forest tracking-tight font-medium">
                        {room.title}
                      </h3>
                      <p className="font-sans text-stone-500 text-sm leading-relaxed">
                        {room.shortDescription}
                      </p>
                      
                      {/* Live Occupancy features */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {room.amenities?.slice(0, 4).map((amenity, i) => (
                          <span key={i} className="text-[11px] font-sans font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-stone-400">Base Price</span>
                        <span className="text-2xl font-heading font-medium text-teal-800">
                          {room.price}
                        </span>
                        <span className="text-xs text-stone-400 font-sans ml-1">
                          /{room.priceSuffix || 'month'}
                        </span>
                      </div>

                      <Link to={`/rooms/${room.slug || room.id}`}>
                        <Button variant="outline" size="sm" className="group-hover:border-teal-600 group-hover:text-teal-700 transition-colors">
                          View details <ChevronRight size={14} className="inline ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Luxury Amenities Showcase */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 xl:px-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="font-heading text-3xl font-light text-dark-forest tracking-tight">
              A bespoke array of hospitality-grade amenities
            </h2>
            <p className="font-sans text-stone-500 text-sm">
              We design every functional element to support your productivity, organic physical wellness, and leisure requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 border flex items-center justify-center text-teal-600">
                <Heart size={22} className="stroke-[1.5]" />
              </div>
              <h3 className="font-heading font-medium text-lg text-dark-forest">Organic Dining</h3>
              <p className="font-sans text-sm text-stone-500 leading-relaxed">
                Chef-curated vegetarian meals prepared daily using pure, high-quality organic farm ingredients.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 border flex items-center justify-center text-teal-600">
                <Compass size={22} className="stroke-[1.5]" />
              </div>
              <h3 className="font-heading font-medium text-lg text-dark-forest">Executive Workspaces</h3>
              <p className="font-sans text-sm text-stone-500 leading-relaxed">
                Quiet zones, high-backed ergonomic seating, high-speed power slots, and dedicated soundproof corners.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 border flex items-center justify-center text-teal-600">
                <ShieldCheck size={22} className="stroke-[1.5]" />
              </div>
              <h3 className="font-heading font-medium text-lg text-dark-forest">Elite Housekeeping</h3>
              <p className="font-sans text-sm text-stone-500 leading-relaxed">
                Daily dynamic cleaning of bedrooms, bathrooms, and utility corridors, keeping your environment spotless.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 border flex items-center justify-center text-teal-600">
                <Sparkles size={22} className="stroke-[1.5]" />
              </div>
              <h3 className="font-heading font-medium text-lg text-dark-forest">Rooftop Cafe</h3>
              <p className="font-sans text-sm text-stone-500 leading-relaxed">
                Bespoke lush rooftop seating space ideal for reading books, relaxing under twilight, and community connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. High-Performance Location FAQs */}
      <section className="bg-stone-50 py-16 md:py-24 border-t border-stone-200/50">
        <div className="max-w-[800px] mx-auto px-5 md:px-8 text-center md:text-left space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-3xl font-light text-dark-forest tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="font-sans text-stone-500 text-sm max-w-md mx-auto">
              Everything you need to understand about reservations, leases, food systems, and guest policies.
            </p>
          </div>

          <div className="space-y-6">
            {content.faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/50 space-y-3 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start space-x-3 text-left">
                  <HelpCircle className="text-teal-600 shrink-0 mt-1" size={18} />
                  <h3 className="font-heading font-medium text-base text-dark-forest leading-snug">
                    {faq.q}
                  </h3>
                </div>
                <p className="font-sans text-sm text-stone-500 leading-relaxed pl-7 text-left">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Conversion-Focused Final CTA */}
      <section className="bg-dark-forest text-warm-cream py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="relative max-w-[1200px] mx-auto px-5 md:px-8 xl:px-12 text-center space-y-8">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Reserve your eco-luxury suite today
          </h2>
          <p className="font-sans text-stone text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Spaces are limited due to high local demand. Complete your reservation online with a 50% advance deposit to secure your pristine room.
          </p>
          <div>
            <Link to="/booking">
              <Button variant="primary" className="px-10 py-4 text-sm font-semibold tracking-wider uppercase">
                Secure Stay Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

export default SeoLandingPage;
