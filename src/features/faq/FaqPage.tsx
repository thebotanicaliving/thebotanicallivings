import { useState } from 'react';
import { useFAQ } from '@/hooks/useFAQ';
import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { IconWrapper } from '@/components/shared/IconWrapper';

export function FaqPage() {
  const { faqs, loading, error, refresh } = useFAQ();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Pricing & Booking', 'Food & Dining', 'Facilities & Services', 'Location', 'Security & Operations'];

  // Filter FAQ items
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleAccordion = (id: string) => {
    setOpenIndex((prev) => (prev === id ? null : id));
  };

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-warm-cream pb-16">
      <Section variant="cream" className="!py-10 md:!py-16">
        <Container className="space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-button text-[10px] font-semibold uppercase tracking-widest text-gold-accent block animate-fadeIn">
              Help Desk
            </span>
            <Heading level={1} className="text-3xl md:text-5xl font-light text-dark-forest tracking-tight animate-fadeIn">
              Frequently Asked Questions
            </Heading>
            <Paragraph size="md" className="text-text-secondary max-w-lg mx-auto font-light leading-relaxed animate-fadeIn">
              Clear, honest information about pricing, security deposits, laundry, healthy meals, and general operations at Botanical Living co-living suites.
            </Paragraph>
          </div>

          {/* Search bar & Categories Pills */}
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-y border-border/25 py-6">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setOpenIndex(null);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border cursor-pointer transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-dark-forest border-dark-forest text-warm-cream shadow-sm'
                        : 'bg-white border-border/30 text-text-secondary hover:border-dark-forest/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Type search terms..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOpenIndex(null);
                  }}
                  className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-full pl-10 pr-4 py-2 text-xs transition-all text-text-primary placeholder-text-secondary/50 font-light"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50">
                  <IconWrapper name="menu" className="rotate-90" size={14} />
                </span>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-24 text-center space-y-4 animate-pulse">
              <div className="w-10 h-10 border-4 border-gold-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-text-secondary">Retrieving FAQ catalog...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-[24px] border border-border/30">
              <p className="text-sm text-text-primary font-medium">Failed to retrieve FAQs</p>
              <p className="text-xs text-text-secondary">{error.message}</p>
              <button
                onClick={refresh}
                className="bg-dark-forest text-warm-cream px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-primary-forest transition-colors cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredFaqs.length === 0 && (
            <p className="text-center text-text-secondary text-sm font-light py-12">
              No matching FAQs found. Please try general terms like "pricing" or "food".
            </p>
          )}

          {/* Interactive Accordion Panel */}
          {!loading && !error && filteredFaqs.length > 0 && (
            <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
              {filteredFaqs.map((faq) => {
                const isOpen = openIndex === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white border border-border/30 rounded-[18px] overflow-hidden transition-shadow duration-200 hover:shadow-subtle"
                  >
                    <button
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full text-left p-5 md:p-6 flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                    >
                      <span className="font-heading text-base md:text-lg font-light text-dark-forest tracking-wide leading-snug">
                        {faq.question}
                      </span>
                      <span className={`text-gold-accent flex-shrink-0 transition-transform duration-350 ${isOpen ? 'rotate-180' : ''}`}>
                        <IconWrapper name="menu" className="-rotate-90" size={16} />
                      </span>
                    </button>
                    
                    {/* Collapsible body */}
                    <div
                      className={`transition-all duration-350 ease-in-out ${
                        isOpen ? 'max-h-64 border-t border-border/15 opacity-100 p-5 md:p-6 bg-stone/10' : 'max-h-0 opacity-0 overflow-hidden'
                      }`}
                    >
                      <Paragraph size="sm" className="text-text-secondary leading-relaxed font-light">
                        {faq.answer}
                      </Paragraph>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </Container>
      </Section>
    </div>
  );
}
export default FaqPage;
