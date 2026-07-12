import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '@/hooks/useBookings';
import { bookingService } from '@/services/booking.service';
import { Button } from '@/components/shared';
import { ArrowLeft, Save, Trash2, Archive, CheckCircle2, XCircle, Key, LogOut, RotateCcw, MessageSquare } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import { ConfirmDialog } from '@/components/admin/dialogs/ConfirmDialog';

export function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { booking, loading, refresh } = useBooking(id);
  const { showToast } = useToast();
  const [notes, setNotes] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setNotes(booking.notes || '');
    }
  }, [booking]);

  const handleStatusTransition = async (newStatus: any, successMessage: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await bookingService.updateBookingStatus(id, newStatus);
      showToast(successMessage, 'success');
      refresh();
    } catch (error) {
      showToast(`Failed to update stay status to ${newStatus}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      await bookingService.updateBookingNotes(id, notes);
      showToast('Internal notes saved successfully', 'success');
      refresh();
    } catch (error) {
      showToast('Failed to save notes', 'error');
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    try {
      await bookingService.updateBookingStatus(id, 'archived');
      showToast('Booking archived', 'success');
      navigate('/admin/bookings');
    } catch (error) {
      showToast('Failed to archive', 'error');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await bookingService.deleteBooking(id);
      showToast('Booking deleted successfully', 'success');
      navigate('/admin/bookings');
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Loading stay file details...</div>;
  if (!booking) return <div className="p-8 text-center text-stone-500">Booking file not found</div>;

  // Render flexible guest names (new vs legacy)
  const guestName = booking.firstName ? `${booking.firstName} ${booking.lastName}` : (booking.name || 'Anonymous Guest');
  const hasBilling = booking.grandTotal !== undefined;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/admin/bookings')} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2" size={20} /> Back to Bookings
      </Button>
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-dark-forest">
              {booking.bookingRef || `ID-${booking.id?.slice(0, 8).toUpperCase()}`}
            </h1>
            <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full border ${
              booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
              booking.status === 'checked_in' ? 'bg-teal-50 text-teal-800 border-teal-100' :
              booking.status === 'checked_out' ? 'bg-stone-100 text-stone-800 border-stone-200' :
              booking.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-100' :
              booking.status === 'payment_pending' ? 'bg-orange-50 text-orange-800 border-orange-100' :
              booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-100' :
              'bg-stone-100 text-stone-800 border-stone-200'
            }`}>
              {booking.status}
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-1">Submitted on {new Date(booking.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleArchive}>
            <Archive className="mr-2" size={15} /> Archive
          </Button>
          <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => setIsDeleting(true)}>
            <Trash2 className="mr-2" size={15} /> Delete
          </Button>
        </div>
      </div>

      {/* STATE TRANSITIONS CONTROLLERS PANEL */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border/10 mb-8">
        <h2 className="text-sm uppercase font-bold tracking-wider text-gold-accent font-button mb-4">Stay Workflow Actions</h2>
        
        <div className="flex flex-wrap gap-3">
          {/* Transition buttons dependent on current state */}
          {(booking.status === 'pending' || booking.status === 'payment_pending') && (
            <>
              <Button 
                onClick={() => handleStatusTransition('confirmed', 'Stay reservation approved and confirmed.')}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="mr-2" size={16} /> Approve & Confirm
              </Button>
              <Button 
                onClick={() => handleStatusTransition('rejected', 'Inquiry rejected.')}
                disabled={actionLoading}
                variant="outline"
                className="text-red-600 border-red-100 hover:bg-red-50"
              >
                <XCircle className="mr-2" size={16} /> Reject Inquiry
              </Button>
            </>
          )}

          {(booking.status === 'confirmed' || booking.status === 'paid') && (
            <>
              <Button 
                onClick={() => handleStatusTransition('checked_in', 'Guest checked in successfully.')}
                disabled={actionLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Key className="mr-2" size={16} /> Check In Guest
              </Button>
              <Button 
                onClick={() => handleStatusTransition('cancelled', 'Booking cancelled.')}
                disabled={actionLoading}
                variant="outline"
                className="text-red-600 border-red-100 hover:bg-red-50"
              >
                <XCircle className="mr-2" size={16} /> Cancel Stay
              </Button>
            </>
          )}

          {booking.status === 'checked_in' && (
            <Button 
              onClick={() => handleStatusTransition('checked_out', 'Guest checked out. Suite released back to available rooms.')}
              disabled={actionLoading}
              className="bg-stone-700 hover:bg-stone-800 text-white"
            >
              <LogOut className="mr-2" size={16} /> Check Out Guest
            </Button>
          )}

          {booking.status === 'cancelled' && (
            <Button 
              onClick={() => handleStatusTransition('refunded', 'Advance refund status marked.')}
              disabled={actionLoading}
              variant="outline"
              className="text-purple-600 border-purple-100 hover:bg-purple-50"
            >
              <RotateCcw className="mr-2" size={16} /> Refund Advance
            </Button>
          )}

          {/* Quick WhatsApp Contact */}
          <a
            href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 bg-[#25D366] text-white hover:bg-[#20ba5a] text-xs font-medium px-4 py-2.5 rounded-xl transition-all"
          >
            <MessageSquare size={15} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Guest Information */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border/10 space-y-4">
          <h2 className="text-base font-bold text-dark-forest border-b pb-2">Guest Profile</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-stone-500">Name:</span> <span className="font-semibold text-stone-900">{guestName}</span></div>
            <div><span className="text-stone-500">Email:</span> <a href={`mailto:${booking.email}`} className="text-forest hover:underline font-medium">{booking.email}</a></div>
            <div><span className="text-stone-500">Phone:</span> <span className="font-medium font-mono">{booking.phone}</span></div>
            <div><span className="text-stone-500">WhatsApp Connection:</span> <span className="font-medium font-mono">{booking.whatsapp || 'Same'}</span></div>
            {booking.aadhaarNumber && (
              <div><span className="text-stone-500">Aadhaar Card:</span> <span className="font-semibold text-dark-forest font-mono">{booking.aadhaarNumber}</span></div>
            )}
            {booking.permanentAddress && (
              <div><span className="text-stone-500">Permanent Address:</span> <span className="font-semibold text-dark-forest">{booking.permanentAddress}</span></div>
            )}
          </div>
        </div>
        
        {/* Stay Parameters */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border/10 space-y-4">
          <h2 className="text-base font-bold text-dark-forest border-b pb-2">Stay Parameters</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-stone-500">Room Category:</span> <span className="font-semibold text-stone-900">{booking.roomTitle || booking.roomName || booking.roomId}</span></div>
            <div><span className="text-stone-500">Check-In Date:</span> <span className="font-semibold text-dark-forest">{booking.checkInDate || booking.moveInDate || 'N/A'}</span></div>
            <div><span className="text-stone-500">Check-Out Date:</span> <span className="font-semibold text-dark-forest">{booking.checkOutDate || 'N/A'}</span></div>
            <div><span className="text-stone-500">Duration:</span> <span className="font-medium">{booking.numberOfNights ? `${booking.numberOfNights} Nights` : (booking.duration || 'N/A')}</span></div>
            {booking.adultsCount !== undefined && (
              <div><span className="text-stone-500">Occupancy:</span> <span className="font-medium">{booking.adultsCount} Adult(s), {booking.childrenCount} Child(ren)</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Invoice Billing Receipt breakdown */}
      {hasBilling && (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border/10 mb-8 space-y-4">
          <h2 className="text-base font-bold text-dark-forest border-b pb-2">Invoice Stay Billing Logs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-stone-500">
                <span>Room Charges:</span>
                <span className="font-semibold text-stone-900">₹{booking.baseAmount}</span>
              </div>
              {booking.extraGuestsAmount > 0 && (
                <div className="flex justify-between text-stone-500">
                  <span>Extra Guests Fee:</span>
                  <span className="font-semibold text-stone-900">₹{booking.extraGuestsAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Cleaning Services:</span>
                <span className="font-semibold text-stone-900">₹{booking.cleaningFee}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Platform Concierge:</span>
                <span className="font-semibold text-stone-900">₹{booking.platformFee}</span>
              </div>
            </div>

            <div className="space-y-2 border-l md:pl-8 border-stone-100">
              <div className="flex justify-between text-stone-500">
                <span>Security Deposit (Refundable):</span>
                <span className="font-semibold text-stone-900">₹{booking.securityDeposit}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount Applied:</span>
                  <span>-₹{booking.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500 border-b pb-2">
                <span>GST Taxes:</span>
                <span className="font-semibold text-stone-900">₹{booking.taxesAmount}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-dark-forest pt-1">
                <span>Grand Total:</span>
                <span>₹{booking.grandTotal}</span>
              </div>
              <div className="flex justify-between text-xs text-gold-accent font-semibold mt-2 bg-gold-accent/5 p-2 rounded-lg border border-gold-accent/10">
                <span>Advance Paid (Razorpay):</span>
                <span className="font-bold">₹{booking.advanceAmount}</span>
              </div>
            </div>
          </div>
          
          {booking.paymentDetails && (
            <div className="bg-stone-50 p-4 rounded-xl text-xs font-mono text-stone-500 space-y-1 mt-4">
              <div><strong className="text-stone-700">Razorpay Payment ID:</strong> {booking.paymentDetails.paymentId}</div>
              <div><strong className="text-stone-700">Razorpay Order ID:</strong> {booking.paymentDetails.orderId}</div>
              <div><strong className="text-stone-700">Verification Signature:</strong> {booking.paymentDetails.signature}</div>
              {booking.paymentDetails.paidAt && (
                <div><strong className="text-stone-700">Paid Timestamp:</strong> {new Date(booking.paymentDetails.paidAt).toLocaleString()}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Guest message */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border/10 mb-8">
        <h2 className="text-base font-bold text-dark-forest border-b pb-2 mb-3">Guest Special Instructions</h2>
        <p className="text-stone-700 whitespace-pre-wrap text-sm">{booking.message || booking.notes || 'No instructions specified.'}</p>
      </div>

      {/* Internal notes */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border/10">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-base font-bold text-dark-forest">Administrative Audit Notes</h2>
          <Button size="sm" onClick={handleSaveNotes}>
            <Save size={15} className="mr-2" /> Save notes
          </Button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Log stay guidelines, custom upgrades, or phone summary guidelines here..."
          className="w-full h-32 p-3 border rounded-xl focus:ring-0 focus:border-gold-accent text-sm outline-none resize-none"
        />
      </div>

      <ConfirmDialog
        isOpen={isDeleting}
        title="Delete Stay booking"
        message="Are you sure you want to delete this stay booking? This will remove all logs permanently."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(false)}
        isDestructive={true}
      />
    </div>
  );
}

export default BookingDetails;
