import { useState } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/shared/Button';
import { IconWrapper } from '@/components/shared/IconWrapper';

interface BookingFormProps {
  defaultRoomType?: string;
  onSuccessSubmit?: (docId: string) => void;
  className?: string;
}

export function BookingForm({ defaultRoomType = 'Single Sharing', onSuccessSubmit, className }: BookingFormProps) {
  const { settings } = useSettings();
  const { submitEnquiry, submitting, success, error, resetState } = useBooking();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    email: '',
    roomType: defaultRoomType,
    checkInDate: '',
    duration: '6 Months',
    guestsCount: 1,
    notes: '',
  });

  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuestsChange = (increment: boolean) => {
    setFormData((prev) => {
      const newCount = increment ? prev.guestsCount + 1 : prev.guestsCount - 1;
      return { ...prev, guestsCount: Math.max(1, Math.min(newCount, 4)) };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const docId = await submitEnquiry(formData);
    if (docId) {
      setSubmittedData({ id: docId, ...formData });
      if (onSuccessSubmit) {
        onSuccessSubmit(docId);
      }
    }
  };

  const triggerWhatsAppRedirect = () => {
    if (!submittedData) return;
    const { firstName, lastName, roomType, checkInDate, duration, guestsCount } = submittedData;
    const cleanPhone = (settings?.whatsapp || '').replace(/[^0-9]/g, '');
    const message = `Hello Botanical Living,

I have submitted a booking enquiry. Here are the details:
- Name: ${firstName} ${lastName}
- Room Type: ${roomType}
- Check-In: ${checkInDate}
- Duration: ${duration}
- Guests: ${guestsCount}

Could you please confirm the current availability and next steps?

Thank you.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  };

  if (success && submittedData) {
    return (
      <div className="bg-cream-card/30 border border-gold-accent/20 rounded-[24px] p-6 md:p-8 text-center space-y-6 animate-fadeIn">
        <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
          <IconWrapper name="sparkles" size={28} />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl md:text-2xl font-light text-dark-forest">
            Enquiry Received
          </h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto font-light leading-relaxed">
            Thank you, <span className="font-semibold text-dark-forest">{submittedData.firstName}</span>. Your booking request for <span className="font-medium text-dark-forest">{submittedData.roomType}</span> has been stored in our secure reservation system.
          </p>
        </div>

        <div className="border-t border-border/30 pt-4 max-w-xs mx-auto">
          <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-3">
            Instant Confirmation
          </p>
          <Button
            variant="primary"
            onClick={triggerWhatsAppRedirect}
            className="w-full justify-center gap-2 text-xs uppercase tracking-widest py-3 rounded-full shadow-md hover:scale-[1.01]"
          >
            Connect on WhatsApp
            <IconWrapper name="whatsapp" className="" size={16} />
          </Button>
          <p className="text-[10px] text-text-secondary font-light mt-2 italic">
            Connecting on WhatsApp ensures priority callback within 15 minutes.
          </p>
        </div>

        <button
          onClick={() => {
            resetState();
            setSubmittedData(null);
            setFormData({
              firstName: '',
              lastName: '',
              phone: '',
              whatsapp: '',
              email: '',
              roomType: defaultRoomType,
              checkInDate: '',
              duration: '6 Months',
              guestsCount: 1,
              notes: '',
            });
          }}
          className="text-xs font-semibold text-text-secondary hover:text-dark-forest underline block mx-auto pt-2 cursor-pointer transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-rose-50 border border-rose-200/50 text-rose-700 text-xs px-4 py-3 rounded-button font-medium flex items-center gap-2">
          <IconWrapper name="close" size={16} />
          <span>Error submitting booking: {error.message}. Please try again.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary placeholder-text-secondary/50 font-light"
          />
        </div>

        {/* Last Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary placeholder-text-secondary/50 font-light"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            placeholder="+91 98765 43210"
            className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary placeholder-text-secondary/50 font-light"
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
            WhatsApp Number
          </label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary placeholder-text-secondary/50 font-light"
          />
        </div>
      </div>

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
          placeholder="johndoe@example.com"
          className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary placeholder-text-secondary/50 font-light"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Room Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
            Room Choice *
          </label>
          <select
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-3 py-2.5 text-sm transition-all text-text-primary font-light"
          >
            <option value="Single Sharing">Single Sharing Room</option>
            <option value="Two Sharing">Two Sharing Room</option>
          </select>
        </div>

        {/* Check-In Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
            Intended Check-In *
          </label>
          <input
            type="date"
            name="checkInDate"
            required
            value={formData.checkInDate}
            onChange={handleChange}
            className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-4 py-2.5 text-sm transition-all text-text-primary font-light"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Duration of Stay */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
            Intended Duration *
          </label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-button px-3 py-2.5 text-sm transition-all text-text-primary font-light"
          >
            <option value="1-3 Months">1-3 Months Stay</option>
            <option value="3-6 Months">3-6 Months Stay</option>
            <option value="6 Months">6 Months Stay (Recommended)</option>
            <option value="12+ Months">12+ Months Stay</option>
          </select>
        </div>

        {/* Number of Guests counter */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button block">
            Number of Residents
          </label>
          <div className="flex items-center justify-between border border-border/40 rounded-button bg-white h-[42px] px-3">
            <button
              type="button"
              disabled={formData.guestsCount <= 1}
              onClick={() => handleGuestsChange(false)}
              className="text-text-secondary hover:text-dark-forest disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center font-bold text-lg cursor-pointer"
            >
              -
            </button>
            <span className="text-sm font-medium text-dark-forest">
              {formData.guestsCount}
            </span>
            <button
              type="button"
              disabled={formData.guestsCount >= 4}
              onClick={() => handleGuestsChange(true)}
              className="text-text-secondary hover:text-dark-forest disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 flex items-center justify-center font-bold text-lg cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
          Additional Notes & Preferences
        </label>
        <textarea
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Let us know your dietary preferences, working hours, or any specific requirements..."
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
        {submitting ? 'Storing Request...' : 'Send Booking Enquiry'}
      </Button>
    </form>
  );
}
export default BookingForm;
