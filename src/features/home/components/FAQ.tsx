import { Section, Container, Heading, Paragraph, ScrollReveal, Accordion } from '@/components/shared';
import { Content } from '@/constants/content';

export function FAQ() {
  const { faqs } = Content;

  // Prepare Schema.org JSON-LD
  const schemaMarkup = {
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

  return (
    <Section
      id="faq"
      variant="light"
      spacing="same"
      className="bg-white"
    >
      {/* Inject SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Container className="max-w-4xl">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <ScrollReveal variant="slideUp">
            <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block mb-2">
              {"Common Inquiries"}
            </span>
            <Heading level={2} className="text-dark-forest">
              {"Frequently Asked Questions"}
            </Heading>
            <Paragraph size="md" className="max-w-xl mx-auto">
              {"Everything you need to know about your future premium sanctuary at Botanical Living."}
            </Paragraph>
          </ScrollReveal>
        </div>

        <ScrollReveal variant="slideUp" delay={0.2}>
          <div className="bg-cream/20 rounded-card p-6 md:p-8 border border-border/40">
            <Accordion 
              items={faqs.map((f, i) => ({ id: `faq-${i}`, ...f }))}
            />
          </div>
        </ScrollReveal>
        
        <ScrollReveal variant="slideUp" delay={0.3} className="mt-12 text-center">
          <Paragraph size="sm" className="text-text-secondary">
            {"Still have questions? "}
            <a 
              href="#final-cta" 
              className="text-gold-accent font-semibold hover:underline decoration-gold-accent/30 underline-offset-4"
            >
              {"Contact our concierge service"}
            </a>
          </Paragraph>
        </ScrollReveal>
      </Container>
    </Section>
  );
}

export default FAQ;
