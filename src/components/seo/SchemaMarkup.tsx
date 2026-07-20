import { Hotel } from '@/constants/hotel';
import { Content } from '@/constants/content';

export function SchemaMarkup() {
  const { faqs } = Content;
  
  // 1. LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": Hotel.name,
    "image": "https://thebotanicallivings.com/og-image.jpg", // Replace with real OG image if exists
    "@id": "https://thebotanicallivings.com",
    "url": "https://thebotanicallivings.com",
    "telephone": Hotel.contact.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "715B, B Block, Plot No. 714, Botanical Garden Road, Sri Ram Nagar",
      "addressLocality": "Kondapur, Hyderabad",
      "postalCode": "500084",
      "addressRegion": "Telangana",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 17.4589, // Approximate for Kondapur
      "longitude": 78.3619
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://www.instagram.com/botanical_living/",
      "https://www.facebook.com/botanicallivinghyd"
    ]
  };

  // 2. FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  // 3. Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://thebotanicallivings.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Rooms",
        "item": "https://thebotanicallivings.com/rooms"
      }
    ]
  };

  // 4. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": Hotel.name,
    "url": "https://thebotanicallivings.com",
    "logo": "https://thebotanicallivings.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": Hotel.contact.phone,
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi", "te"]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
