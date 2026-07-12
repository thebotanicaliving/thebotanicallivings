import { useFAQ } from '@/hooks/useFAQ';
import { Section, Container, Heading, Paragraph, Accordion } from '@/components/shared';

export function Faq() {
  const { faqs } = useFAQ();
  return (
    <Section
      id="faq-section"
      variant="light"
      spacing="same"
    >
      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left column: Title */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
          <span className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent block">
            {"FAQ"}
          </span>
          <Heading level={2} className="text-dark-forest">
            {"Frequently Asked Questions"}
          </Heading>
          <Paragraph size="md">
            "Find answers to the most common questions about living at Botanical Living."
          </Paragraph>
        </div>

        {/* Right column: Reusable Accordion */}
        <div className="lg:col-span-7">
          <Accordion items={faqs.filter(f => f.published).slice(0, 5).map(f => ({ ...f, id: f.id || Math.random().toString() }))} />
        </div>
      </Container>
    </Section>
  );
}
export default Faq;
