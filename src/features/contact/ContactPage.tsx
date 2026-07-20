import { useSettings } from '@/hooks/useSettings';
import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { ContactForm } from '@/components/shared/ContactForm';
import { IconWrapper } from '@/components/shared/IconWrapper';

export function ContactPage() {
    const { settings } = useSettings();
  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-warm-cream pb-16">
      <Section variant="cream" className="!py-10 md:!py-16">
        <Container className="space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-button text-[10px] font-semibold uppercase tracking-widest text-gold-accent block animate-fadeIn">
              Connect With Us
            </span>
            <Heading level={1} className="text-3xl md:text-5xl font-light text-dark-forest tracking-tight animate-fadeIn">
              Get In Touch
            </Heading>
            <Paragraph size="md" className="text-text-secondary max-w-lg mx-auto font-light leading-relaxed animate-fadeIn">
              Have questions about lease terms, checking in, food preferences, or booking a video walk-through? Send a message or call our reservations team directly.
            </Paragraph>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-[1200px] mx-auto items-start">
            
            {/* Left Column: Business details card and Google Maps */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Detailed Business info card */}
              <div className="bg-dark-forest text-warm-cream p-6 md:p-8 rounded-[24px] border border-white/5 shadow-subtle space-y-6">
                <Heading level={3} className="text-lg font-medium text-warm-cream tracking-wide">
                  Reservations Office
                </Heading>
                
                <div className="space-y-4">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="p-2 bg-white/10 rounded-xl text-gold-accent flex-shrink-0 h-10 w-10 flex items-center justify-center">
                      <IconWrapper name="address" size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs text-stone font-semibold uppercase tracking-wider block">Address Location</span>
                      <p className="text-xs text-warm-cream/90 font-light leading-relaxed">{(settings?.address || "")}</p>
                    </div>
                  </div>

                  {/* Phones */}
                  <div className="flex gap-4">
                    <div className="p-2 bg-white/10 rounded-xl text-gold-accent flex-shrink-0 h-10 w-10 flex items-center justify-center">
                      <IconWrapper name="phone" size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs text-stone font-semibold uppercase tracking-wider block">Phone & WhatsApp</span>
                      <p className="text-xs text-warm-cream/90 font-light">
                        Call/WhatsApp: <a href={`tel:${(settings?.phone || "").replace(/\s+/g, '')}`} className="underline font-medium">{(settings?.phone || "")}</a>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="p-2 bg-white/10 rounded-xl text-gold-accent flex-shrink-0 h-10 w-10 flex items-center justify-center">
                      <IconWrapper name="email" size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs text-stone font-semibold uppercase tracking-wider block">Email Channels</span>
                      <p className="text-xs text-warm-cream/90 font-light">
                        Reservations: <a href={`mailto:${(settings?.primaryEmail || "")}`} className="underline font-medium">{(settings?.primaryEmail || "")}</a>
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4">
                    <div className="p-2 bg-white/10 rounded-xl text-gold-accent flex-shrink-0 h-10 w-10 flex items-center justify-center">
                      <IconWrapper name="hours" size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs text-stone font-semibold uppercase tracking-wider block">Operating Hours</span>
                      <p className="text-xs text-warm-cream/90 font-light">{(settings?.businessHours || "")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Embed Frame */}
              <div className="relative rounded-[24px] overflow-hidden border border-border/30 h-64 md:h-80 shadow-sm bg-black">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15224.237895058728!2d78.3512345!3d17.456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93e218000001%3A0x7d0180ff92790104!2sBotanical%20Garden%20Road%2C%20Kondapur%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1655000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Botanical Living Location Map"
                  className="w-full h-full object-cover"
                />
              </div>

            </div>

            {/* Right Column: Interactive Form panel */}
            <div className="lg:col-span-7 bg-white border border-border/30 rounded-[28px] p-6 md:p-10 shadow-subtle space-y-6">
              <div className="space-y-1.5">
                <Heading level={2} className="text-xl md:text-2xl font-light text-dark-forest">
                  Send A Message
                </Heading>
                <Paragraph size="sm" className="text-text-secondary font-light">
                  Required fields are marked with an asterisk (*). We will reply to your registered email address within 24 hours.
                </Paragraph>
              </div>

              <div className="border-t border-border/15 my-2" />

              <ContactForm />
            </div>

          </div>

        </Container>
      </Section>
    </div>
  );
}
export default ContactPage;
