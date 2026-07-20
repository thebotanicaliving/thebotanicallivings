import { Hotel } from '@/constants/hotel';
import { Assets } from '@/constants/assets';
import { FooterNavigation } from '@/constants/navigation';
import { IconWrapper } from '@/components/shared/IconWrapper';
import { Link } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';

export function Footer() {
  const { settings } = useSettings();

  const socialLinks = [
    { name: 'Instagram', icon: 'instagram', url: settings.instagram },
    { name: 'Facebook', icon: 'facebook', url: settings.facebook },
    { name: 'LinkedIn', icon: 'linkedin', url: settings.linkedin },
    { name: 'YouTube', icon: 'youtube', url: settings.youtube },
    { name: 'Twitter', icon: 'twitter', url: settings.twitter },
  ].filter(social => social.url && social.url.trim() !== '');

  return (
    <footer
      id="app-footer"
      className="bg-dark-forest text-warm-cream border-t border-primary-forest/30 pt-16 md:pt-20 pb-8"
    >
      <div className="max-w-[1300px] mx-auto px-5 md:px-8 xl:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 xl:gap-16">
        {/* Brand Column */}
        <div className="space-y-6">
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-95 transition-opacity duration-200"
          >
            <img 
              src={Assets.logos.icon} 
              alt="Botanical Living Icon Footer" 
              className="h-9 w-auto brightness-0 invert" 
            />
            <img 
              src={Assets.logos.wordmark} 
              alt="Botanical Living Wordmark Logo Footer" 
              className="h-6 w-auto brightness-0 invert" 
            />
          </Link>
          <div className="flex flex-col hidden">
            <span className="font-heading text-xl font-bold tracking-tight text-warm-cream uppercase leading-none">
              {Hotel.name}
            </span>
            <span className="font-sans text-[8px] tracking-[0.2em] text-gold-accent uppercase font-bold">
              {Hotel.tagline}
            </span>
          </div>
          <p className="font-sans text-sm leading-relaxed text-stone/80 max-w-sm">
            {Hotel.description}
          </p>
          {/* Social Links from settings */}
          <div className="flex items-center space-x-4 pt-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-primary-forest/40 flex items-center justify-center text-stone hover:text-gold-accent hover:border-gold-accent transition-all duration-250 bg-primary-forest/10"
                aria-label={`Follow Botanical Living on ${social.name}`}
              >
                <IconWrapper
                  name={social.icon as any}
                  size={16}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="space-y-4">
          <h4 className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent">
            Quick Links
          </h4>
          <ul className="space-y-3">
            {FooterNavigation.discover.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="font-sans text-sm text-stone hover:text-warm-cream transition-colors duration-250"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Stays & Support Column */}
        <div className="space-y-4">
          <h4 className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent">
            Support & Info
          </h4>
          <ul className="space-y-3">
            {FooterNavigation.support.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="font-sans text-sm text-stone hover:text-warm-cream transition-colors duration-250"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 font-sans text-sm text-stone/70">
              <span className="block font-semibold text-stone/90 mb-1">Office Hours:</span>
              {Hotel.contact.businessHours}
            </li>
          </ul>
        </div>

        {/* Contact Information Column */}
        <div className="space-y-4">
          <h4 className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent">
            Contact Us
          </h4>
          <div className="space-y-3 font-sans text-sm text-stone/80">
            <div className="flex items-start space-x-2">
              <IconWrapper name="address" className="text-gold-accent shrink-0 mt-0.5" size={16} />
              <span>{Hotel.location.fullAddress}</span>
            </div>
            <div className="flex items-center space-x-2">
              <IconWrapper name="phone" className="text-gold-accent shrink-0" size={16} />
              <a href={`tel:${Hotel.contact.phone.replace(/\s+/g, '')}`} className="hover:text-warm-cream transition-colors">
                {Hotel.contact.phone}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <IconWrapper name="email" className="text-gold-accent shrink-0" size={16} />
              <a href={`mailto:${Hotel.contact.email}`} className="hover:text-warm-cream transition-colors break-all">
                {Hotel.contact.email}
              </a>
            </div>
          </div>

          {/* Premium WhatsApp CTA */}
          <div className="pt-4">
            <a
              href={`https://wa.me/${Hotel.contact.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center space-x-3 w-full max-w-[240px] px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-button text-xs font-bold tracking-wider uppercase rounded-button shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <IconWrapper name="whatsapp" size={20} className="" />
              <span className="font-bold text-white tracking-widest">WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </div>

      {/* Border & Copyright */}
      <div className="max-w-[1300px] mx-auto px-5 md:px-8 xl:px-12 mt-16 pt-8 border-t border-primary-forest/20 flex flex-col md:flex-row items-center justify-between text-xs text-stone/50 space-y-4 md:space-y-0 text-center md:text-left">
        <div>{`© ${new Date().getFullYear()} ${Hotel.name}. All Rights Reserved.`}</div>
        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6">
          <Link
            to="/privacy-policy"
            className="hover:text-warm-cream transition-colors duration-250"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-and-conditions"
            className="hover:text-warm-cream transition-colors duration-250"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
