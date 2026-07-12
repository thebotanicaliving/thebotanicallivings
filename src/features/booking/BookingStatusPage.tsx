import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { BookingRequest } from '@/types';
import { Section, Container, Heading, Paragraph, Button, Card } from '@/components/shared';
import { AlertCircle, MessageSquare, Search, ArrowLeft, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export function BookingStatusPage() {
  const [searchParams] = useSearchParams();
  const [bookingRefInput, setBookingRefInput] = useState(searchParams.get('ref') || '');
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') || '');
  
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get('ref') && searchParams.get('phone')) {
      handleSearch(undefined, searchParams.get('ref')!, searchParams.get('phone')!);
    }
  }, [searchParams]);

  const handleSearch = async (e?: React.FormEvent, refVal = bookingRefInput, phoneVal = phoneInput) => {
    if (e) e.preventDefault();
    if (!refVal.trim() || !phoneVal.trim()) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);
    setSearched(true);

    try {
      if (!db) {
        throw new Error('Database is offline');
      }

      // Query by bookingRef
      const q = query(
        collection(db, 'bookingRequests'),
        where('bookingRef', '==', refVal.trim().toUpperCase())
      );
      const snap = await getDocs(q);
      
      if (snap.empty) {
        // Try fallback by direct doc id
        const docRef = doc(db, 'bookingRequests', refVal.trim());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const b = { id: docSnap.id, ...docSnap.data() } as BookingRequest;
          if (b.phone.replace(/[^0-9]/g, '').includes(phoneVal.trim().replace(/[^0-9]/g, '')) || b.phone === phoneVal.trim()) {
            setBooking(b);
            setLoading(false);
            return;
          }
        }
        setError('No booking found with this reference and phone number.');
        setLoading(false);
        return;
      }

      let found = false;
      snap.forEach(d => {
        const b = { id: d.id, ...d.data() } as BookingRequest;
        const normalizedInputPhone = phoneVal.trim().replace(/[^0-9]/g, '');
        const normalizedDbPhone = b.phone.replace(/[^0-9]/g, '');
        
        if (normalizedDbPhone.includes(normalizedInputPhone) || normalizedInputPhone.includes(normalizedDbPhone) || b.phone === phoneVal.trim()) {
          setBooking(b);
          found = true;
        }
      });

      if (!found) {
        setError('Reference matched, but phone number verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while fetching stay details. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: BookingRequest['status']) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      pending: { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-800', label: 'Received', icon: AlertCircle },
      payment_pending: { bg: 'bg-orange-50 text-orange-800 border-orange-200', text: 'text-orange-800', label: 'Payment Pending', icon: AlertCircle },
      paid: { bg: 'bg-blue-50 text-blue-800 border-blue-200', text: 'text-blue-800', label: 'Paid (Awaiting Confirmation)', icon: ShieldCheck },
      confirmed: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-800', label: 'Stay Confirmed', icon: ShieldCheck },
      checked_in: { bg: 'bg-teal-50 text-teal-800 border-teal-200', text: 'text-teal-800', label: 'Checked In', icon: ShieldCheck },
      checked_out: { bg: 'bg-stone-100 text-stone-800 border-stone-200', text: 'text-stone-800', label: 'Checked Out', icon: Heart },
      completed: { bg: 'bg-stone-50 text-stone-600 border-stone-200', text: 'text-stone-600', label: 'Completed Stays', icon: Heart },
      cancelled: { bg: 'bg-red-50 text-red-800 border-red-200', text: 'text-red-800', label: 'Cancelled', icon: AlertCircle },
      refunded: { bg: 'bg-purple-50 text-purple-800 border-purple-200', text: 'text-purple-800', label: 'Refunded', icon: AlertCircle },
      rejected: { bg: 'bg-stone-100 text-stone-500 border-stone-200', text: 'text-stone-500', label: 'Enquiry Rejected', icon: AlertCircle }
    };
    const c = configs[status] || { bg: 'bg-stone-100 text-stone-800 border-stone-200', text: 'text-stone-800', label: status, icon: AlertCircle };
    const IconComponent = c.icon;
    return (
      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${c.bg}`}>
        <IconComponent size={13} />
        <span>{c.label}</span>
      </span>
    );
  };

  const getWhatsAppShareLink = () => {
    if (!booking) return '#';
    const message = `Hello Botanical Living team, I am checking on my booking reference ${booking.bookingRef}. Status is: ${booking.status.toUpperCase()}.`;
    return `https://wa.me/919966471719?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen pt-32 pb-16 bg-stone-50">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center space-y-4 mb-10">
            <span className="font-button text-[10px] font-bold tracking-widest text-gold-accent uppercase">Live Tracking</span>
            <Heading level={1} className="text-4xl md:text-5xl font-light text-dark-forest">
              Stay Status Tracker
            </Heading>
            <Paragraph className="text-text-secondary max-w-md mx-auto">
              Verify your premium reservation status, advance payment logs, and scheduled stay dates.
            </Paragraph>
          </div>

          <Card className="p-8 md:p-10 bg-white shadow-subtle border-0 rounded-[32px] mb-8">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
                  Booking Reference / ID
                </label>
                <input
                  type="text"
                  placeholder="BOT-2026-XXXXXX"
                  value={bookingRefInput}
                  onChange={(e) => setBookingRefInput(e.target.value)}
                  className="w-full p-3.5 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone with code"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full p-3.5 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-sm justify-center rounded-xl md:col-span-1"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Track Stay'}
              </Button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-700 text-sm animate-fadeIn">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </Card>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
              <Paragraph className="text-text-secondary font-medium">Retrieving booking secure database details...</Paragraph>
            </div>
          )}

          {!loading && searched && booking && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-subtle border-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/20 mb-6">
                  <div>
                    <span className="text-xs text-text-secondary">Booking Reference</span>
                    <h2 className="text-2xl font-mono font-bold text-dark-forest uppercase mt-0.5">{booking.bookingRef}</h2>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-1">
                    <span className="text-xs text-text-secondary">Current Status</span>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Guest & Room information */}
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase font-bold tracking-wider text-gold-accent font-button">Stay & Accomodation</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-stone-50 pb-2">
                        <span className="text-sm text-text-secondary">Suite Category</span>
                        <span className="text-sm font-medium text-dark-forest">{booking.roomTitle}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-2">
                        <span className="text-sm text-text-secondary">Primary Guest</span>
                        <span className="text-sm font-medium text-dark-forest">{booking.firstName} {booking.lastName}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-2">
                        <span className="text-sm text-text-secondary">Contact Email</span>
                        <span className="text-sm font-medium text-dark-forest truncate max-w-[180px]">{booking.email}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-2">
                        <span className="text-sm text-text-secondary">Dates Scheduled</span>
                        <span className="text-sm font-medium text-dark-forest">
                          {new Date(booking.checkInDate).toLocaleDateString()} to {new Date(booking.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-2">
                        <span className="text-sm text-text-secondary">Total Duration</span>
                        <span className="text-sm font-medium text-dark-forest">{booking.numberOfNights} Night{booking.numberOfNights > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-50 pb-2">
                        <span className="text-sm text-text-secondary">Occupancy Details</span>
                        <span className="text-sm font-medium text-dark-forest">{booking.adultsCount} Adult{booking.adultsCount > 1 ? 's' : ''}, {booking.childrenCount} Child{booking.childrenCount !== 1 ? 'ren' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-4 bg-stone-50/50 p-6 rounded-2xl border border-border/10">
                    <h3 className="text-xs uppercase font-bold tracking-wider text-gold-accent font-button">Payment Summary</h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between text-text-secondary">
                        <span>Room Charges ({booking.numberOfNights} Nights)</span>
                        <span>₹{booking.baseAmount}</span>
                      </div>
                      {booking.extraGuestsAmount > 0 && (
                        <div className="flex justify-between text-text-secondary">
                          <span>Extra Guests Fee</span>
                          <span>₹{booking.extraGuestsAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-text-secondary">
                        <span>Cleaning & Services</span>
                        <span>₹{booking.cleaningFee}</span>
                      </div>
                      <div className="flex justify-between text-text-secondary">
                        <span>Platform Handling Fee</span>
                        <span>₹{booking.platformFee}</span>
                      </div>
                      <div className="flex justify-between text-text-secondary">
                        <span>Refundable Security Deposit</span>
                        <span>₹{booking.securityDeposit}</span>
                      </div>
                      {booking.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Aesthetic Discount</span>
                          <span>-₹{booking.discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-text-secondary">
                        <span>GST & Taxes Amount</span>
                        <span>₹{booking.taxesAmount}</span>
                      </div>
                      <div className="h-px bg-border/20 my-2" />
                      <div className="flex justify-between font-bold text-dark-forest text-base">
                        <span>Grand Total</span>
                        <span>₹{booking.grandTotal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gold-accent font-semibold mt-1 bg-gold-accent/5 p-2 rounded-lg border border-gold-accent/10">
                        <span>Required Advance (Paid)</span>
                        <span>₹{booking.advanceAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-text-secondary">Payment status:</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      booking.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : booking.paymentStatus === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <a
                      href={getWhatsAppShareLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-medium px-4 py-2.5 rounded-xl transition-all"
                    >
                      <MessageSquare size={14} />
                      <span>Contact Stay Desk</span>
                    </a>
                    
                    <Link
                      to="/"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-stone-100 hover:bg-stone-200 text-dark-forest text-xs font-medium px-4 py-2.5 rounded-xl transition-all"
                    >
                      <span>Return Home</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && searched && !booking && !error && (
            <div className="text-center bg-white p-16 rounded-[32px] shadow-subtle border-0">
              <Search size={48} className="mx-auto text-stone-300 mb-4" />
              <Heading level={3} className="text-lg font-medium text-dark-forest">No records found</Heading>
              <Paragraph className="text-text-secondary mt-2 max-w-sm mx-auto">
                Double check your exact booking reference (e.g. BOT-2026-000001) and associated phone code.
              </Paragraph>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
export default BookingStatusPage;
