import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { Button } from '@/components/shared';
import { Eye, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '@/services/booking.service';
import { useToast } from '@/providers/ToastProvider';

export function BookingsList() {
  const { bookings, loading, refresh } = useBookings();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();

  const filteredBookings = bookings.filter((b) => {
    const guestName = b.firstName ? `${b.firstName} ${b.lastName}` : (b.name || 'Anonymous Guest');
    const matchesSearch = guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.bookingRef && b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await bookingService.updateBookingStatus(id, newStatus);
      showToast('Status updated successfully', 'success');
      refresh();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading bookings...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
      </div>

      <div className="flex gap-4 mb-6 bg-white p-4 rounded-card shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-48">
          <Filter className="absolute left-3 top-3 text-stone-400" size={20} />
          <select
            className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="paid">Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="completed">Completed Stays</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-card shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-stone-600">Guest Name</th>
              <th className="p-4 font-semibold text-stone-600">Contact</th>
              <th className="p-4 font-semibold text-stone-600">Room Info</th>
              <th className="p-4 font-semibold text-stone-600">Status</th>
              <th className="p-4 font-semibold text-stone-600">Date</th>
              <th className="p-4 font-semibold text-stone-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-stone-500">No bookings found.</td></tr>
            ) : filteredBookings.map((booking) => {
              const guestName = booking.firstName ? `${booking.firstName} ${booking.lastName}` : (booking.name || 'Anonymous Guest');
              const roomInfo = booking.roomTitle || booking.roomName || booking.roomId;
              const dateInfo = booking.checkInDate ? `${booking.checkInDate} to ${booking.checkOutDate}` : (booking.moveInDate || 'N/A');
              const refLabel = booking.bookingRef || `REF-${booking.id?.slice(0, 6).toUpperCase()}`;

              return (
                <tr key={booking.id} className="border-b hover:bg-stone-50/50">
                  <td className="p-4">
                    <div className="font-semibold text-stone-950">{guestName}</div>
                    <div className="text-xs text-gold-accent font-mono mt-0.5">{refLabel}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="truncate w-44">{booking.email}</div>
                    <div className="text-stone-500">{booking.phone}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="font-medium text-dark-forest">{roomInfo}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{dateInfo}</div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id!, e.target.value as any)}
                      className={`text-xs font-semibold py-1 px-2.5 rounded-full border focus:ring-0 cursor-pointer ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        booking.status === 'checked_in' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        booking.status === 'checked_out' ? 'bg-stone-50 text-stone-600 border-stone-200' :
                        booking.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        booking.status === 'payment_pending' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                        booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' :
                        'bg-stone-100 text-stone-800 border-stone-200'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="payment_pending">Payment Pending</option>
                      <option value="paid">Paid</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="checked_out">Checked Out</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="p-4 text-sm">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/bookings/${booking.id}`)}>
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
