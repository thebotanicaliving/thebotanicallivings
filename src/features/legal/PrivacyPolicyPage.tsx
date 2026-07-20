import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';

export function PrivacyPolicyPage() {
  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-warm-cream pb-16">
      <Section variant="cream" className="!py-10 md:!py-16">
        <Container className="max-w-3xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-3 border-b border-border/20 pb-8">
            <span className="font-button text-[10px] font-semibold uppercase tracking-widest text-gold-accent block">
              Legal Statement
            </span>
            <Heading level={1} className="text-3xl md:text-5xl font-light text-dark-forest tracking-tight">
              Privacy Policy
            </Heading>
            <Paragraph size="sm" className="text-text-secondary/80 font-mono tracking-wider uppercase text-[10px]">
              Last Updated: July 2026
            </Paragraph>
          </div>

          {/* Legal Content */}
          <div className="space-y-8 text-text-primary font-sans leading-relaxed text-sm">
            
            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                1. Commitment to Privacy
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                At Botanical Living, we hold a deep respect for your personal sanctuary—which extends to your digital privacy. This Privacy Policy details our practices regarding the collection, processing, use, and security of information obtained when you interact with our luxury reservation portal, request tour walkthroughs, or complete booking registrations.
              </Paragraph>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                2. Information We Collect
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                To coordinate your stay and curate premium custom meal plans, we collect information you share directly with us, including:
              </Paragraph>
              <ul className="list-disc pl-5 space-y-1.5 text-text-secondary font-light">
                <li>Contact credentials (full name, email address, WhatsApp/phone number).</li>
                <li>Stay preferences (check-in dates, dietary choices, preferred layouts).</li>
                <li>Digital interactions (enquiry request details, tour submissions).</li>
              </ul>
              <Paragraph size="md" className="text-text-secondary font-light">
                We do not collect sensitive payment cards on this website; all booking completions are confirmed securely via official reservations desk coordination channels.
              </Paragraph>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                3. Purpose of Processing
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                Your personal details are used strictly to provide a bespoke living experience:
              </Paragraph>
              <ul className="list-disc pl-5 space-y-1.5 text-text-secondary font-light">
                <li>Recording and managing your room availability inquiries.</li>
                <li>Reaching out to you directly via WhatsApp or phone to coordinate check-in.</li>
                <li>Improving our culinary menus and common garden spaces based on visitor statistics.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                4. Data Protection & Sovereignty
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                Your data is stored securely in our Firestore databases. We enforce modern encryption standards, security protocols, and strict access control to prevent unauthorized disclosure, leakage, or loss of information.
              </Paragraph>
              <Paragraph size="md" className="text-text-secondary font-light">
                We will never sell, trade, or distribute your private contact details to third-party marketing companies. Data is shared only with certified database cloud processors required to maintain this website.
              </Paragraph>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                5. Your Rights
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                You retain complete sovereignty over your data. You may request to inspect, correct, update, or completely purge your recorded reservation profile from our systems at any time by contacting us directly via our WhatsApp channels.
              </Paragraph>
            </section>

            <section className="space-y-3">
              <Heading level={2} className="text-lg font-medium text-dark-forest tracking-wide">
                6. Policy Modifications
              </Heading>
              <Paragraph size="md" className="text-text-secondary font-light">
                As we expand our botanical concepts, we may occasionally update our privacy procedures. We encourage visitors to review this page periodically to remain informed about how we safeguard their sanctuary.
              </Paragraph>
            </section>

          </div>

          <div className="border-t border-border/20 pt-8 text-center">
            <Paragraph size="sm" className="text-text-secondary font-light">
              For any queries regarding this policy, please reach out directly to our privacy desk.
            </Paragraph>
          </div>

        </Container>
      </Section>
    </div>
  );
}

export default PrivacyPolicyPage;
