import { useState } from 'react';
import { useContact } from '@/hooks/useContact';
import { Button } from '@/components/shared/Button';
import { IconWrapper } from '@/components/shared/IconWrapper';

export function ContactForm() {
  const { submitContact, submitting, success, error, resetState } = useContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Enquiry',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    await submitContact(formData);
  };

  if (success) {
    return (
      <div className="bg-cream-card/30 border border-gold-accent/20 rounded-[24px] p-6 md:p-8 text-center space-y-6 animate-fadeIn">
        <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
          <IconWrapper name="sparkles" size={28} />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl md:text-2xl font-light text-dark-forest">
            Message Received
          </h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto font-light leading-relaxed">
            Thank you, <span className="font-semibold text-dark-forest">{formData.name}</span>. Your enquiry has been safely recorded. Our hospitality coordinator will email or call you back shortly.
          </p>
        </div>

        <button
          onClick={() => {
            resetState();
            setFormData({
              name: '',
              email: '',
              phone: '',
              subject: 'General Enquiry',
              message: '',
            });
          }}
          className="text-xs font-semibold text-text-secondary hover:text-dark-forest underline block mx-auto pt-2 cursor-pointer transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-rose-50 border border-rose-200/50 text-rose-700 text-xs px-4 py-3 rounded-button font-medium flex items-center gap-2">
          <IconWrapper name="close" size={16} />
          <span>Error submitting enquiry: {error.message}. Please try again.</span>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
          Full Name *
        </label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Ananya Sharma"
          className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary placeholder-text-secondary/50 font-light"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="ananya@example.com"
            className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary placeholder-text-secondary/50 font-light"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 99000 12345"
            className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary placeholder-text-secondary/50 font-light"
          />
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
          Subject *
        </label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-3 py-2.5 text-sm transition-all text-text-primary font-light"
        >
          <option value="General Enquiry">General Enquiry</option>
          <option value="Booking & Availability">Booking & Availability</option>
          <option value="Food & Meals">Food & Meals</option>
          <option value="Housekeeping & Laundry">Housekeeping & Laundry</option>
          <option value="Complaints / Feedback">Complaints or Feedback</option>
        </select>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
          Message *
        </label>
        <textarea
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="How can we assist you? Please write your query in detail..."
          className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary placeholder-text-secondary/50 font-light resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        disabled={submitting}
        className="w-full justify-center text-xs tracking-widest uppercase py-3 font-semibold shadow-md rounded-button transition-all duration-300 hover:scale-[1.005]"
      >
        {submitting ? 'Sending Message...' : 'Send Message'}
      </Button>
    </form>
  );
}
export default ContactForm;
