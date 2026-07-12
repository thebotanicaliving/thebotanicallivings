import { Star, Quote } from 'lucide-react';
import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { useReviews } from '@/hooks/useReviews';
import { ReviewItem } from '@/types';

interface TestimonialCardProps {
  item: ReviewItem;
}

function TestimonialCard({ item }: TestimonialCardProps) {
  return (
    <div className="w-[320px] md:w-[380px] shrink-0 bg-white border border-border/40 rounded-[20px] p-6 md:p-8 flex flex-col justify-between h-[230px] md:h-[250px] shadow-subtle hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Top Section: Stars & Quote Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-gold-accent">
          {[...Array(item.rating || 5)].map((_, i) => (
            <Star key={i} size={14} className="fill-current" />
          ))}
        </div>
        <Quote className="text-stone-200 group-hover:text-gold-accent/20 transition-colors duration-300 h-8 w-8" />
      </div>

      {/* Quote text */}
      <p className="font-sans text-stone-700 text-xs md:text-sm leading-relaxed font-light italic mt-3 mb-4 flex-grow line-clamp-4">
        "{item.quote}"
      </p>

      {/* Bottom Section: Author Info */}
      <div className="flex items-center space-x-3 pt-3 border-t border-border/20">
        <div className="h-10 w-10 rounded-full bg-olive/10 text-olive text-xs font-semibold flex items-center justify-center shrink-0">
          {item.initials}
        </div>
        <div className="min-w-0">
          <h4 className="font-serif text-sm text-dark-forest font-semibold truncate">
            {item.name}
          </h4>
          <span className="font-sans text-[11px] text-stone-500 block truncate">
            {item.role} • <span className="text-gold-accent">{item.stayType}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const { reviews, loading } = useReviews();

  const eyebrow = "Resident Stories";
  const heading = "Experience the Difference";
  const description = "Hear from professionals who have made Botanical Living their sanctuary.";

  // Filter only published reviews
  const publishedReviews = reviews.filter(r => r.published !== false);

  // Divide reviews into two alternating rows
  const row1 = publishedReviews.filter((_, idx) => idx % 2 === 0);
  const row2 = publishedReviews.filter((_, idx) => idx % 2 !== 0);

  // Fill rows to at least 10 items to prevent empty space in continuous marquee on ultra-wide screens
  const fillRow = (rowItems: ReviewItem[]) => {
    if (rowItems.length === 0) return [];
    let repeated = [...rowItems];
    while (repeated.length < 10) {
      repeated = [...repeated, ...rowItems];
    }
    return repeated;
  };

  const row1Repeated = fillRow(row1);
  const row2Repeated = fillRow(row2);

  if (loading && publishedReviews.length === 0) {
    return (
      <Section id="testimonials" variant="cream" className="relative overflow-hidden border-t border-b border-border/50 !py-24">
        <div className="text-center py-8 text-stone-500 font-mono text-sm">
          Loading guest stories...
        </div>
      </Section>
    );
  }

  return (
    <Section id="testimonials" variant="cream" className="relative overflow-hidden border-t border-b border-border/50 !py-24">
      {/* Decorative ambient elements for Botanical mood */}
      <div className="absolute top-0 left-0 w-64 h-68 bg-olive/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-68 bg-olive/5 rounded-full filter blur-3xl pointer-events-none" />

      <Container>
        {/* Elegant Section Header with contrast text */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
            {eyebrow}
          </span>
          <Heading level={2} className="text-dark-forest max-w-2xl text-center">
            {heading}
          </Heading>
          <Paragraph size="md" className="text-text-secondary max-w-lg text-center font-light leading-relaxed">
            {description}
          </Paragraph>
        </div>
      </Container>

      {publishedReviews.length > 0 ? (
        /* Marquee Rows with Blur/Fade Edge Masks */
        <div className="relative w-full overflow-hidden flex flex-col space-y-6 md:space-y-8 py-6">
          {/* Left Fade Mask */}
          <div className="absolute left-0 top-0 bottom-0 w-28 md:w-56 bg-gradient-to-r from-warm-cream via-warm-cream/95 via-warm-cream/40 to-transparent z-20 pointer-events-none" />
          {/* Right Fade Mask */}
          <div className="absolute right-0 top-0 bottom-0 w-28 md:w-56 bg-gradient-to-l from-warm-cream via-warm-cream/95 via-warm-cream/40 to-transparent z-20 pointer-events-none" />

          {/* Row 1: Sliding Left */}
          {row1Repeated.length > 0 && (
            <div className="w-full flex">
              <div className="flex gap-6 w-max animate-marquee-left hover:[animation-play-state:paused] py-2">
                {row1Repeated.map((item, index) => (
                  <TestimonialCard key={`${item.id}-${index}`} item={item} />
                ))}
                {/* Duplicate for infinite loop */}
                {row1Repeated.map((item, index) => (
                  <TestimonialCard key={`${item.id}-${index}-dup`} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Row 2: Sliding Right */}
          {row2Repeated.length > 0 && (
            <div className="w-full flex">
              <div className="flex gap-6 w-max animate-marquee-right hover:[animation-play-state:paused] py-2">
                {row2Repeated.map((item, index) => (
                  <TestimonialCard key={`${item.id}-${index}`} item={item} />
                ))}
                {/* Duplicate for infinite loop */}
                {row2Repeated.map((item, index) => (
                  <TestimonialCard key={`${item.id}-${index}-dup`} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-stone-500 font-mono text-xs py-8">
          No reviews published yet.
        </div>
      )}
    </Section>
  );
}
export default Testimonials;
