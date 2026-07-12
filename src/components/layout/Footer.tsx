import { cn } from '@/utils/cn';
import { FooterNavigation } from '@/constants/navigation';
import { useSettings } from '@/hooks/useSettings';
import { SocialLinks } from '@/constants/social';
import { Assets } from '@/constants/assets';
import { IconWrapper } from '@/components/shared/IconWrapper';
import { Link } from 'react-router-dom';
import { getDirectMediaUrl } from '@/utils/media';

export function Footer() {
    const { settings } = useSettings();
  return (
    <footer
      id="app-footer"
      className="bg-dark-forest text-warm-cream border-t border-primary-forest/30 pt-16 md:pt-20 pb-8"
    >
      <div className="max-w-[1300px] mx-auto px-5 md:px-8 xl:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 xl:gap-16">
        {/* Brand Column */}
        <div className="space-y-6">
          <a
            href="/"
            className="flex items-center space-x-2.5 hover:opacity-95 transition-opacity duration-200"
          >
            {/* Logo Icon */}
            <img
              src={getDirectMediaUrl(settings?.logoUrl) || Assets.logos.icon}
              alt=""
              referrerPolicy="no-referrer"
              className="h-8 md:h-9 w-auto object-contain brightness-0 invert"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Wordmark */}
            <img
              src={getDirectMediaUrl(settings?.wordmarkUrl) || Assets.logos.wordmark}
              alt={(settings?.hotelName || "Botanical Living")}
              referrerPolicy="no-referrer"
              className="h-6 md:h-7 w-auto object-contain brightness-0 invert"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fb = parent.querySelector('.text-fallback');
                  if (fb) fb.classList.remove('hidden');
                }
              }}
            />
            <span className="text-fallback font-heading text-xl font-bold tracking-wide text-warm-cream hidden">
              {(settings?.hotelName || "Botanical Living")}
            </span>
          </a>
          <p className="font-sans text-sm leading-relaxed text-stone/80 max-w-sm">
            {(settings?.tagline || "")}
          </p>
          {/* Social Links */}
          <div className="flex items-center space-x-4 pt-2">
            {[
              { name: 'Instagram', url: settings?.instagram, icon: 'instagram' },
              { name: 'Facebook', url: settings?.facebook, icon: 'facebook' },
              { name: 'LinkedIn', url: settings?.linkedin, icon: 'linkedin' },
              { name: 'YouTube', url: settings?.youtube, icon: 'youtube' },
              { name: 'Twitter', url: settings?.twitter, icon: 'twitter' },
            ]
              .filter(link => link.url)
              .map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full border border-primary-forest/40 flex items-center justify-center text-stone hover:text-gold-accent hover:border-gold-accent transition-all duration-250 bg-primary-forest/10"
                  aria-label={`Follow Botanical Living on ${social.name}`}
                >
                  <IconWrapper
                    name={social.icon.toLowerCase() as never}
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
              {(settings?.businessHours || "")}
            </li>
          </ul>
        </div>

        {/* Contact Information & WhatsApp Column */}
        <div className="space-y-4">
          <h4 className="font-button text-xs font-semibold uppercase tracking-widest text-gold-accent">
            Contact Us
          </h4>
          <div className="space-y-3 font-sans text-sm text-stone/80">
            <div className="flex items-start space-x-2">
              <IconWrapper name="address" className="text-gold-accent shrink-0 mt-0.5" size={16} />
              <span>{(settings?.address || "")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <IconWrapper name="phone" className="text-gold-accent shrink-0" size={16} />
              <a href={`tel:${(settings?.phone || "").replace(/\s+/g, '')}`} className="hover:text-warm-cream transition-colors">
                {(settings?.phone || "")}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <IconWrapper name="email" className="text-gold-accent shrink-0" size={16} />
              <a href={`mailto:${(settings?.primaryEmail || "")}`} className="hover:text-warm-cream transition-colors break-all">
                {(settings?.primaryEmail || "")}
              </a>
            </div>
          </div>

          {/* Premium High-Contrast WhatsApp CTA button */}
          <div className="pt-4">
            <a
              href={`https://wa.me/${(settings?.whatsapp || "").replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center space-x-3 w-full max-w-[240px] px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-button text-xs font-bold tracking-wider uppercase rounded-button shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-dark-forest group"
            >
              <IconWrapper 
                name="whatsapp" 
                className="text-white h-5 w-5 fill-current filter drop-shadow" 
                size={20} 
              />
              <span className="font-bold text-white tracking-widest">Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Border & Copyright */}
      <div className="max-w-[1300px] mx-auto px-5 md:px-8 xl:px-12 mt-16 pt-8 border-t border-primary-forest/20 flex flex-col md:flex-row items-center justify-between text-xs text-stone/50 space-y-4 md:space-y-0 text-center md:text-left">
        <div>{`© ${new Date().getFullYear()} ${settings?.hotelName}. All Rights Reserved.`}</div>
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
          <span className="text-stone/30">Managed securely via Cloud Run & Firebase</span>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
