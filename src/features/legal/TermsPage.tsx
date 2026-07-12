import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';

export function TermsPage() {
  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-warm-cream pb-16">
      <Section variant="cream" className="!py-10 md:!py-16">
        <Container className="max-w-3xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-3 border-b border-border/20 pb-8">
            <span className="font-button text-[10px] font-semibold uppercase tracking-widest text-gold-accent block">
              User Agreement
            </span>
            <Heading level={1} className="text-3xl md:text-5xl font-light text-dark-forest tracking-tight">
              Terms & Conditions
            </Heading>
            <Paragraph size="sm" className="text-text-secondary/80 font-mono tracking-wider uppercase text-[10px]">
              Last Updated: July 2026
            </Paragraph>
          </div>

          {/* Legal Content */}
          <div className="space-y-8 text-text-primary font-sans leading-relaxed text-sm">
            
            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                1. Acceptance of Terms
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                By browsing this website, viewing our virtual 360° tours, or submitting booking enquiries, you agree to comply with and be bound by these Terms and Conditions. These terms govern the relationship between you (the guest/visitor) and Botanical Living regarding our online hospitality services.
              </Paragraph>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                2. Stay Bookings & Enquiries
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                All booking enquiries submitted through this platform are subject to real-time verification and room availability checks. Submission of an inquiry form does NOT constitute a confirmed lease or reservation:
              </Paragraph>
              <ul className="list-disc pl-5 space-y-1.5 text-text-secondary font-light">
                <li>Availability dates are live, but final room locks are only guaranteed upon receipt of reservation deposits.</li>
                <li>Rates quoted are subject to seasonal variations and tax guidelines, which will be detailed during your direct checkout conversation with our coordinator.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                3. Sanctuary & Conduct Guidelines
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                Botanical Living is designed as an eco-friendly sanctuary. Guests are expected to maintain the peace and respect common areas:
              </Paragraph>
              <ul className="list-disc pl-5 space-y-1.5 text-text-secondary font-light">
                <li>Respectful noise levels must be observed, especially within student quiet zones and living room lounges.</li>
                <li>Lush vertical gardens, plants, and hydroponic green areas are key parts of our ecosystem. Any damage to flora is strictly prohibited.</li>
                <li>Common kitchens and rooftop cafes are shared spaces; guests are expected to clean up after themselves to keep the environment hygienic.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                4. Cancellation & Refund Policy
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                Since we maintain an exclusive inventory of custom premium suites, our cancellation terms are designed to be fair to both parties:
              </Paragraph>
              <ul className="list-disc pl-5 space-y-1.5 text-text-secondary font-light">
                <li>Full refunds of booking deposits are provided for cancellations made up to 14 days prior to the registered check-in date.</li>
                <li>Cancellations within 7 to 13 days of check-in will receive a 50% refund.</li>
                <li>No refunds are provided for cancellations made within less than 7 days of the scheduled check-in.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                5. Intellectual Property
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                All media content, editorial photographs, video recordings, graphics, 360° virtual tours, brand logos, and copy displayed on this website are the absolute property of Botanical Living and may not be copied, reproduced, or used commercially without written permission.
              </Paragraph>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                6. Limitation of Liability
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                Botanical Living provides this website, including its room details and availability indexes, on an "as-is" and "as available" basis. While we strive to ensure 100% accuracy, we do not guarantee that the portal will operate without minor digital interruptions.
              </Paragraph>
            </section>

          </div>

          <div className="border-t border-border/20 pt-8 text-center">
            <Paragraph size="sm" className="text-text-secondary font-light">
              We appreciate your partnership in making Botanical Living a quiet, serene, and conscious community.
            </Paragraph>
          </div>

        </Container>
      </Section>
    </div>
  );
}

export default TermsPage;
