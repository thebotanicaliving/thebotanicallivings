import { useState, useEffect } from 'react';
import { Section, Container, Heading, Paragraph, Button, Card } from '@/components/shared';
import { ChevronLeft, CreditCard, X, Calendar, Home, Shield, Check, Coffee, Utensils, Moon } from 'lucide-react';
import { useRooms } from '@/hooks/useRooms';
import { db } from '@/firebase/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit, writeBatch } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { availabilityService } from '@/services/availability.service';
import { Room } from '@/types';
import { getDirectMediaUrl } from '@/utils/media';

// Declare global Razorpay interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function BookingPage() {
  const { rooms, loading: roomsLoading } = useRooms();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  
  // Date and Room selection (Step 1)
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getThreeDaysLaterString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  };

  const [checkInDate, setCheckInDate] = useState(getTomorrowString());
  const [checkOutDate, setCheckOutDate] = useState(getThreeDaysLaterString());
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount] = useState(0); // Lock children count to 0 per business logic update
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  const getRoomMaxCapacity = (room: any) => {
    if (!room) return 2;
    const title = (room.title || '').toLowerCase();
    if (title.includes('single')) {
      return 1;
    }
    return 2;
  };

  const getPhysicalRoomsForRoom = (room: any) => {
    if (!room) return [];
    if (room.physicalRooms && Array.isArray(room.physicalRooms) && room.physicalRooms.length > 0) {
      return room.physicalRooms;
    }
    const idStr = String(room.id || room.slug || '').toLowerCase();
    const titleStr = String(room.title || '').toLowerCase();
    
    if (idStr.includes('single') || titleStr.includes('single')) {
      return [
        { number: '101', floor: '1st Floor' },
        { number: '102', floor: '1st Floor' },
        { number: '201', floor: '2nd Floor' },
        { number: '202', floor: '2nd Floor' },
        { number: '301', floor: '3rd Floor' },
        { number: '302', floor: '3rd Floor' }
      ];
    } else {
      return [
        { number: '103', floor: '1st Floor' },
        { number: '104', floor: '1st Floor' },
        { number: '203', floor: '2nd Floor' },
        { number: '204', floor: '2nd Floor' },
        { number: '303', floor: '3rd Floor' },
        { number: '304', floor: '3rd Floor' }
      ];
    }
  };

  const isOverlapping = (bIn: string, bOut: string, selIn: string, selOut: string) => {
    if (!bIn || !bOut || !selIn || !selOut) return false;
    return bIn < selOut && bOut > selIn;
  };

  const getBookedRoomNumbers = (roomId: string) => {
    return existingBookings
      .filter(b => b.roomId === roomId && b.status !== 'cancelled' && b.status !== 'rejected' && b.status !== 'refunded' && isOverlapping(b.checkInDate, b.checkOutDate, checkInDate, checkOutDate))
      .map(b => b.roomNumber)
      .filter(Boolean);
  };

  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Toggle food option
  const toggleFoodOption = (id: string) => {
    setSelectedFoodIds(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      recalculatePrice(updated);
      return updated;
    });
  };

  // Guest Details (Step 2)
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    email: '',
    notes: '',
    aadhaarNumber: '',
    permanentAddress: ''
  });

  // Price calculation state (Step 3)
  const [priceDetails, setPriceDetails] = useState<any>(null);

  // Payment state (Step 4)
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Confirmed booking state (Step 5)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Load Razorpay script dynamically with state management
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    if ((window as any).Razorpay) {
      setRazorpayReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
  }, []);

  // Fetch previous bookings for active stay window conflict tracking
  useEffect(() => {
    const fetchExistingBookings = async () => {
      if (!db) return;
      try {
        const snap = await getDocs(collection(db, 'bookingRequests'));
        const list: any[] = [];
        snap.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setExistingBookings(list);
      } catch (err) {
        console.warn('Error fetching existing bookings for room allocation', err);
      }
    };
    fetchExistingBookings();
  }, [checkInDate, checkOutDate]);

  // Sync selected room details and reset physical allocation parameters on room change
  useEffect(() => {
    if (selectedRoomId && rooms.length > 0) {
      const room = rooms.find(r => r.id === selectedRoomId);
      if (room) {
        setSelectedRoom(room);
        setSelectedRoomNumber('');
        setSelectedFloor('');
      }
    }
  }, [selectedRoomId, rooms]);

  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({ ...prev, [name]: value }));
  };

  // Real-time automatic availability fetching system whenever date inputs or rooms change
  useEffect(() => {
    if (!checkInDate || !checkOutDate || rooms.length === 0) return;

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    if (end <= start) {
      return;
    }

    let isMounted = true;
    const fetchAvailability = async () => {
      setCheckingAvailability(true);
      try {
        const checkedRooms: any[] = [];
        const activeRooms = rooms.filter(r => r.published !== false);

        for (const room of activeRooms) {
          const totalRooms = Number((room as any).totalRooms || 5);
          
          // Verify availability dynamically
          const inv = await availabilityService.checkRoomAvailability(room.id, checkInDate, checkOutDate, totalRooms);
          const rules = await availabilityService.getPricingRules(room.id);

          checkedRooms.push({
            ...room,
            available: inv.available,
            remainingRooms: inv.remainingRooms,
            totalRooms: inv.totalRooms,
            isBlocked: inv.isBlockedByMaintenance,
            pricingRules: rules,
            currentResidents: inv.currentResidents !== undefined ? inv.currentResidents : (room.currentResidents || 0),
            maxCapacity: inv.maxCapacity !== undefined ? inv.maxCapacity : (room.maxCapacity || room.occupancy || 2)
          });
        }
        if (isMounted) {
          setAvailableRooms(checkedRooms);
        }
      } catch (err) {
        console.error('[Real-time Fetch Error]', err);
      } finally {
        if (isMounted) {
          setCheckingAvailability(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [checkInDate, checkOutDate, rooms]);

  // Step 1 Selection: Select room type and trigger live pricing calculator
  const handleSelectRoom = async (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    // Check capacity
    const maxCap = getRoomMaxCapacity(room);
    if (adultsCount > maxCap) {
      alert(`This room accommodates a maximum of ${maxCap} guest(s). Please reduce your guest count on Step 1.`);
      return;
    }

    setCalculatingPrice(true);
    try {
      const calc = await availabilityService.calculateLivePrice(
        roomId,
        checkInDate,
        checkOutDate,
        adultsCount,
        adultsCount,
        0,
        selectedFoodIds
      );
      setPriceDetails(calc);
      setStep(2); // Direct to Guest details!
    } catch (err) {
      console.error(err);
      alert('Error calculating stay pricing parameters. Please retry.');
    } finally {
      setCalculatingPrice(false);
    }
  };

  // Step 2: Validate guest details and go to summary
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone || !guestInfo.aadhaarNumber || !guestInfo.permanentAddress) {
      alert('Please fill out all required fields.');
      return;
    }
    if (!selectedRoomNumber) {
      alert('Please select an available floor & room number before proceeding.');
      return;
    }
    setStep(3); // Direct to Summary
  };

  const recalculatePrice = async (foodIds: string[]) => {
    if (!selectedRoomId) return;
    try {
      const calc = await availabilityService.calculateLivePrice(
        selectedRoomId,
        checkInDate,
        checkOutDate,
        adultsCount,
        adultsCount,
        0,
        foodIds
      );
      setPriceDetails(calc);
    } catch (err) {
      console.error('Error recalculating pricing:', err);
    }
  };

  const handleCheckoutFoodToggle = (id: string) => {
    const updated = selectedFoodIds.includes(id)
      ? selectedFoodIds.filter(f => f !== id)
      : [...selectedFoodIds, id];
    setSelectedFoodIds(updated);
    recalculatePrice(updated);
  };

  // Sequential human readable booking reference generator
  const generateSequentialRef = async (): Promise<string> => {
    if (!db) return `BOT-2026-000${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const snap = await getDocs(collection(db, 'bookingRequests'));
      const nextNum = 245 + snap.size;
      return `BOT-2026-${String(nextNum).padStart(6, '0')}`;
    } catch (err) {
      console.warn('Error reading count, using fallback random reference', err);
      return `BOT-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    }
  };

  // Step 4: Advance checkout via Razorpay Checkout / Premium Fallback UI
  const handlePayAdvance = async () => {
    if (!priceDetails || !selectedRoom) {
      alert('Unable to proceed. Refresh the page.');
      return;
    }

    setPaymentProcessing(true);
    setPaymentError(null);

    const bookingRef = await generateSequentialRef();

    // Check if Razorpay script is loaded
    if ((window as any).Razorpay) {
      try {
        // 1. Create order on backend passing only criteria for secure server-side price calculation
        const orderResponse = await fetch('/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: selectedRoomId,
            checkInDate,
            checkOutDate,
            adultsCount,
            childrenCount,
            selectedFoodIds,
            receipt: `rcpt_${bookingRef}`
          })
        });

        if (!orderResponse.ok) {
          const errData = await orderResponse.json().catch(() => ({}));
          throw new Error(errData.message || errData.error || 'Failed to create payment order on our secure server.');
        }

        const orderData = await orderResponse.json();
        const orderId = orderData.order_id;

        // Construct booking payload ahead of time for secure backend write
        const bookingPayload: any = {
          bookingRef,
          roomId: selectedRoomId,
          checkInDate,
          checkOutDate,
          numberOfNights: priceDetails.nights,
          guestsCount: adultsCount,
          adultsCount,
          childrenCount: 0,
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          phone: guestInfo.phone,
          whatsapp: guestInfo.whatsapp || guestInfo.phone,
          email: guestInfo.email,
          notes: guestInfo.notes,
          aadhaarNumber: guestInfo.aadhaarNumber,
          permanentAddress: guestInfo.permanentAddress,
          selectedFoodOptions: selectedFoodIds,
          foodAmount: priceDetails.foodAmount,
          advanceAmount: priceDetails.advanceAmount, // Used for backend validation assertion
          roomNumber: selectedRoomNumber,
          floor: selectedFloor,
        };

        // 2. Open Razorpay Standard Checkout modal with the returned order_id
        const options = {
          key: orderData.key_id || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || (import.meta as any).env?.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TFf1vtuOkzqE8z',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Botanical Living & Stays',
          description: `Advance Stay booking reference ${bookingRef}`,
          image: 'https://lh3.googleusercontent.com/d/1PCe61WYkM1LeP6Elr490LhVJYzplNTGL',
          order_id: orderId,
          handler: async function (response: any) {
            try {
              setPaymentProcessing(true);
              // 3. Verify payment signature and complete the write on the secure backend
              const verifyResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingPayload
                })
              });

              if (!verifyResponse.ok) {
                const errData = await verifyResponse.json();
                throw new Error(errData.error || 'Payment signature verification failed.');
              }

              const verifyData = await verifyResponse.json();

              if (verifyData.status === 'success') {
                setConfirmedBooking(verifyData.booking);
                setPaymentSuccess(true);
                setStep(5); // Show Confirmation page directly
              } else {
                throw new Error(verifyData.error || 'Payment verification mismatch.');
              }
            } catch (vErr: any) {
              setPaymentError(vErr?.message || 'Payment verification failed. Please contact support.');
            } finally {
              setPaymentProcessing(false);
            }
          },
          prefill: {
            name: `${guestInfo.firstName} ${guestInfo.lastName}`,
            email: guestInfo.email,
            contact: guestInfo.phone
          },
          theme: {
            color: '#0f2c1b'
          },
          modal: {
            ondismiss: function () {
              setPaymentProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setPaymentError(resp.error.description || 'Payment failed.');
          setPaymentProcessing(false);
        });
        rzp.open();
      } catch (err: any) {
        console.warn('Razorpay checkout launching failed.', err);
        setPaymentError(err?.message || 'Failed to initialize payment gateway.');
        setPaymentProcessing(false);
      }
    } else {
      setPaymentError('Razorpay payment gateway script not loaded. Please wait a moment and try again.');
      setPaymentProcessing(false);
    }
  };

  const handleDemoBypass = async () => {
    if (!priceDetails || !selectedRoom) {
      alert('Unable to proceed. Refresh the page.');
      return;
    }

    setPaymentProcessing(true);
    setPaymentError(null);

    try {
      const bookingRef = await generateSequentialRef();
      const bookingPayload: any = {
        bookingRef,
        roomId: selectedRoomId,
        checkInDate,
        checkOutDate,
        numberOfNights: priceDetails.nights,
        guestsCount: adultsCount,
        adultsCount,
        childrenCount: 0,
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        phone: guestInfo.phone,
        whatsapp: guestInfo.whatsapp || guestInfo.phone,
        email: guestInfo.email,
        notes: guestInfo.notes,
        aadhaarNumber: guestInfo.aadhaarNumber,
        permanentAddress: guestInfo.permanentAddress,
        selectedFoodOptions: selectedFoodIds,
        foodAmount: priceDetails.foodAmount,
        advanceAmount: priceDetails.advanceAmount,
        roomNumber: selectedRoomNumber,
        floor: selectedFloor,
      };

      const demoResponse = await fetch('/api/create-booking-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingPayload })
      });

      if (!demoResponse.ok) {
        const errData = await demoResponse.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || 'Failed to complete demo booking reservation.');
      }

      const demoData = await demoResponse.json();
      if (demoData.status === 'success') {
        setConfirmedBooking(demoData.booking);
        setPaymentSuccess(true);
        setStep(5); // Show Confirmation page directly
      } else {
        throw new Error(demoData.error || 'Demo booking completion mismatch.');
      }
    } catch (err: any) {
      console.warn('Demo bypass booking failed.', err);
      setPaymentError(err?.message || 'Failed to bypass payment in demo mode.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (roomsLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-stone-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
        <p className="text-stone-500 font-button tracking-wider text-xs">LOADING ROOMS & LIVE PRICES...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-stone-50">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Header Progress Indicators */}
          {step < 5 && (
            <div className="text-center space-y-4 mb-12">
              <span className="font-button text-[10px] font-bold tracking-widest text-gold-accent uppercase">Hotel Booking Engine</span>
              <Heading level={1} className="text-4xl md:text-5xl font-light text-dark-forest">
                Reserve Your Stay
              </Heading>
              
              {/* Stepper Progress Bar */}
              <div className="max-w-xl mx-auto flex items-center justify-between pt-8 text-xs font-medium text-stone-400">
                <span className={step >= 1 ? 'text-gold-accent font-semibold' : ''}>1. Suites</span>
                <div className={`flex-1 h-[2px] mx-2 ${step >= 2 ? 'bg-gold-accent/40' : 'bg-stone-200'}`} />
                <span className={step >= 2 ? 'text-gold-accent font-semibold' : ''}>2. Details</span>
                <div className={`flex-1 h-[2px] mx-2 ${step >= 3 ? 'bg-gold-accent/40' : 'bg-stone-200'}`} />
                <span className={step >= 3 ? 'text-gold-accent font-semibold' : ''}>3. Summary</span>
                <div className={`flex-1 h-[2px] mx-2 ${step >= 4 ? 'bg-gold-accent/40' : 'bg-stone-200'}`} />
                <span className={step >= 4 ? 'text-gold-accent font-semibold' : ''}>4. Checkout</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step Content */}
            <div className="lg:col-span-2">
              <Card hover={false} className="p-8 md:p-12 bg-white rounded-[32px] border-0 shadow-subtle min-h-[450px]">
                
                {/* STEP 1: Select Stay Dates & Occupants + Real-time Available Suites */}
                {step === 1 && (
                  <div className="space-y-8 animate-fadeIn">
                    <h3 className="text-xl font-light text-dark-forest border-b border-border/20 pb-4">Select Stay Dates & Occupants</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Check-In Date *</label>
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3.5 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Check-Out Date *</label>
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          min={checkInDate ? new Date(new Date(checkInDate).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                          className="w-full p-3.5 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Number of Guests</label>
                        <div className="flex items-center justify-between border border-border/30 rounded-xl p-2 bg-stone-50/50 max-w-sm">
                          <button
                            type="button"
                            onClick={() => setAdultsCount(p => Math.max(1, p - 1))}
                            className="w-10 h-10 rounded-lg border border-border/40 hover:bg-stone-100 flex items-center justify-center text-sm font-bold"
                          >-</button>
                          <span className="font-heading font-medium text-dark-forest">{adultsCount} Guest{adultsCount > 1 ? 's' : ''}</span>
                          <button
                            type="button"
                            onClick={() => setAdultsCount(p => Math.min(2, p + 1))}
                            className="w-10 h-10 rounded-lg border border-border/40 hover:bg-stone-100 flex items-center justify-center text-sm font-bold"
                          >+</button>
                        </div>
                        <p className="text-[11px] text-text-secondary italic">
                          Maximum capacity is 1 guest for Single sharing suites, and 2 guests for Double sharing suites.
                        </p>
                      </div>
                    </div>



                    <div className="space-y-6 pt-6 border-t border-border/20">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-light text-dark-forest">Available Luxury Suites</h3>
                        {checkingAvailability && (
                          <div className="flex items-center space-x-2 text-xs text-gold-accent">
                            <span className="w-3.5 h-3.5 border-2 border-gold-accent/20 border-t-gold-accent rounded-full animate-spin" />
                            <span>Verifying live inventory...</span>
                          </div>
                        )}
                      </div>

                      {checkingAvailability && availableRooms.length === 0 ? (
                        <div className="space-y-3 pt-2">
                          {[1, 2].map((i) => (
                            <div key={i} className="p-5 border border-border/10 rounded-2xl bg-stone-50/50 animate-pulse flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-2 flex-1">
                                <div className="h-5 bg-stone-200 rounded w-1/3" />
                                <div className="h-4 bg-stone-200 rounded w-2/3" />
                                <div className="h-3 bg-stone-200 rounded w-1/4" />
                              </div>
                              <div className="h-10 bg-stone-200 rounded w-24 self-end md:self-center" />
                            </div>
                          ))}
                        </div>
                      ) : availableRooms.length > 0 ? (
                        <div className="space-y-4 pt-2">
                          {availableRooms.map((room) => {
                            const price = room.pricingRules?.basePrice || 4500;
                            const maxCap = getRoomMaxCapacity(room);
                            const isMaxCapExceeded = adultsCount > maxCap;
                            
                            return (
                              <div 
                                key={room.id}
                                className={`p-5 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all
                                  ${room.available && !isMaxCapExceeded ? 'border-border/60 hover:border-gold-accent bg-white' : 'bg-stone-50 border-stone-200/60 opacity-65'}
                                `}
                              >
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-heading font-medium text-dark-forest text-lg">{room.title}</span>
                                    {room.featured && <span className="bg-gold-accent/10 text-gold-accent px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider">Premium</span>}
                                  </div>
                                  <p className="text-xs text-text-secondary line-clamp-1">{room.description}</p>
                                  
                                  <div className="flex flex-wrap gap-2 text-[10px] text-stone-500 pt-1 font-mono">
                                    <span>Max capacity: {maxCap} Guest{maxCap > 1 ? 's' : ''}</span>
                                    <span>•</span>
                                    <span>Remaining suites: {room.available ? room.remainingRooms : 0} of {room.totalRooms}</span>
                                  </div>

                                  {maxCap === 2 && Number(room.currentResidents || 0) > 0 && (
                                    <div className="text-[10.5px] text-amber-800 bg-amber-50/70 border border-amber-100/60 rounded-lg px-2.5 py-1 mt-2 inline-flex items-center gap-1.5 font-medium font-sans">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                      Double Sharing: 1 occupant currently resident. Second sharing bed open & ready for booking!
                                    </div>
                                  )}
                                </div>

                                <div className="flex md:flex-col items-baseline md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-l border-border/20 pt-4 md:pt-0 md:pl-6 gap-4">
                                  <div className="text-left md:text-right">
                                    <span className="text-xs text-text-secondary font-medium">Starting from</span>
                                    <div className="font-heading font-bold text-gold-accent text-lg">₹{price}<span className="text-xs font-normal text-text-secondary">/night</span></div>
                                  </div>

                                  {room.available && !isMaxCapExceeded ? (
                                    <Button
                                      onClick={() => handleSelectRoom(room.id)}
                                      variant="primary"
                                      className="px-4 py-2 text-xs rounded-lg whitespace-nowrap"
                                    >
                                      Reserve Stay
                                    </Button>
                                  ) : (
                                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider whitespace-nowrap">
                                      {isMaxCapExceeded ? 'Exceeds Capacity' : 'Sold Out'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-stone-500 text-sm">
                          No available suites match these stay dates. Try a different range.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: Guest Information */}
                {step === 2 && (
                  <form onSubmit={handleGuestSubmit} className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-border/20 pb-4">
                      <h3 className="text-xl font-light text-dark-forest">Primary Guest Credentials</h3>
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-gold-accent font-medium hover:underline flex items-center space-x-1">
                        <ChevronLeft size={14} />
                        <span>Change Room</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={guestInfo.firstName}
                          onChange={handleGuestInfoChange}
                          className="w-full p-3 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={guestInfo.lastName}
                          onChange={handleGuestInfoChange}
                          className="w-full p-3 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Phone Code & Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+91 XXXXX XXXXX"
                          value={guestInfo.phone}
                          onChange={handleGuestInfoChange}
                          className="w-full p-3 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">WhatsApp Connection *</label>
                        <input
                          type="tel"
                          name="whatsapp"
                          placeholder="+91 XXXXX XXXXX"
                          value={guestInfo.whatsapp}
                          onChange={handleGuestInfoChange}
                          className="w-full p-3 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={guestInfo.email}
                        onChange={handleGuestInfoChange}
                        className="w-full p-3 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Aadhaar Card Number *</label>
                        <input
                          type="text"
                          name="aadhaarNumber"
                          placeholder="XXXX XXXX XXXX"
                          value={guestInfo.aadhaarNumber}
                          onChange={handleGuestInfoChange}
                          className="w-full p-3 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Permanent Address *</label>
                        <input
                          type="text"
                          name="permanentAddress"
                          placeholder="Full residential address"
                          value={guestInfo.permanentAddress}
                          onChange={handleGuestInfoChange}
                          className="w-full p-3 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm"
                          required
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-500 font-sans italic mt-1">
                      * Your Aadhaar Card details will be securely verified in-person during check-in.
                    </p>

                    {/* Floor and Room Number Selection Grid */}
                    <div className="space-y-4 pt-6 border-t border-border/20">
                      <div>
                        <h4 className="text-sm font-medium text-dark-forest font-button">Select Floor & Room Number</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Pick from our available premium rooms for your stay duration based on active inventory.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Floor Selection */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Floor</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['1st Floor', '2nd Floor', '3rd Floor'].map(floor => {
                              const roomsOnFloor = getPhysicalRoomsForRoom(selectedRoom).filter(r => r.floor === floor);
                              const bookedRooms = getBookedRoomNumbers(selectedRoomId);
                              const availableOnFloor = roomsOnFloor.filter(r => !bookedRooms.includes(r.number));
                              const isAllBooked = availableOnFloor.length === 0;

                              const isSel = selectedFloor === floor;
                              return (
                                <button
                                  key={floor}
                                  type="button"
                                  disabled={isAllBooked}
                                  onClick={() => {
                                    setSelectedFloor(floor);
                                    setSelectedRoomNumber(''); // reset room number when floor changes
                                  }}
                                  className={`py-3 px-2 text-xs rounded-xl border text-center transition-all ${
                                    isAllBooked
                                      ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                                      : isSel
                                      ? 'border-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent text-dark-forest font-semibold'
                                      : 'border-border/40 hover:border-gold-accent/40 text-text-secondary'
                                  }`}
                                >
                                  {floor}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Room Number Selection */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Room Number</label>
                          {selectedFloor ? (
                            <div className="grid grid-cols-2 gap-2">
                              {getPhysicalRoomsForRoom(selectedRoom)
                                .filter(r => r.floor === selectedFloor)
                                .map(r => {
                                  const bookedRooms = getBookedRoomNumbers(selectedRoomId);
                                  const isBooked = bookedRooms.includes(r.number);
                                  const isSel = selectedRoomNumber === r.number;

                                  return (
                                    <button
                                      key={r.number}
                                      type="button"
                                      disabled={isBooked}
                                      onClick={() => setSelectedRoomNumber(r.number)}
                                      className={`py-3 px-2 text-xs rounded-xl border text-center transition-all ${
                                        isBooked
                                          ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through'
                                          : isSel
                                          ? 'border-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent text-dark-forest font-semibold'
                                          : 'border-border/40 hover:border-gold-accent/40 text-text-secondary'
                                      }`}
                                    >
                                      Room {r.number} {isBooked ? '(Booked)' : '(Available)'}
                                    </button>
                                  );
                                })}
                            </div>
                          ) : (
                            <div className="p-3 border border-dashed border-border/40 rounded-xl text-xs text-stone-400 text-center">
                              Please select a floor first
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Food Subscription Preferences - Portrayed beautifully here in Guest credentials section */}
                    <div className="space-y-4 pt-4 border-t border-border/20">
                      <div>
                        <h4 className="text-sm font-medium text-dark-forest font-button">Food Subscription Preferences</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Customize your meals for your stay. Subscriptions are pro-rated on daily basis for shorter stays.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: 'breakfast', name: 'Breakfast (Tiffin)', price: 2000, desc: 'Fresh South Indian & continental breakfast', icon: Coffee },
                          { id: 'lunch', name: 'Homely Lunch', price: 3500, desc: 'Healthy afternoon meals (Veg/Non-Veg options)', icon: Utensils },
                          { id: 'dinner', name: 'Premium Dinner', price: 3500, desc: 'Satisfying evening meals with regional variety', icon: Moon }
                        ].map(food => {
                          const isSelected = selectedFoodIds.includes(food.id);
                          const FoodIcon = food.icon;
                          return (
                            <div 
                              key={food.id}
                              onClick={() => toggleFoodOption(food.id)}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative overflow-hidden select-none ${
                                isSelected 
                                  ? 'border-gold-accent bg-gold-accent/[0.04] ring-1 ring-gold-accent shadow-sm' 
                                  : 'border-border/40 bg-white hover:border-gold-accent/40 shadow-none'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-gold-accent text-white' : 'bg-[#F7F5EF] text-text-secondary'}`}>
                                  <FoodIcon size={18} />
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-gold-accent border-gold-accent text-white' 
                                    : 'border-border/80 bg-white'
                                }`}>
                                  {isSelected && <Check size={11} strokeWidth={3} />}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-sm font-semibold text-dark-forest">{food.name}</div>
                                <p className="text-[11px] leading-relaxed text-text-secondary min-h-[32px]">{food.desc}</p>
                              </div>
                              
                              <div className="pt-2 border-t border-border/10 flex items-center justify-between">
                                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Subscription</span>
                                <span className="text-xs font-bold text-gold-accent">₹{food.price}/mo</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border/20">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">Bespoke Requests / Arrival Notes</label>
                      <textarea
                        name="notes"
                        rows={3}
                        value={guestInfo.notes}
                        onChange={handleGuestInfoChange}
                        placeholder="Specify arrival hours, dietary requests, or aesthetic guidelines."
                        className="w-full p-3 border border-border/40 rounded-xl focus:border-gold-accent focus:outline-none text-sm resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 max-w-md">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto px-8 py-4 justify-center text-sm rounded-xl"
                      >
                        Verify Stay Booking Summary
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="w-full sm:w-auto px-8 py-4 justify-center text-sm rounded-xl"
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                )}

                {/* STEP 3: Live Price Verification & Advance Booking Summary */}
                {step === 3 && priceDetails && selectedRoom && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-border/20 pb-4">
                      <h3 className="text-xl font-light text-dark-forest">Pricing Breakdown Details</h3>
                      <button onClick={() => setStep(2)} className="text-xs text-gold-accent font-medium hover:underline flex items-center space-x-1">
                        <ChevronLeft size={14} />
                        <span>Edit Info</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 bg-stone-50 p-4 rounded-xl border border-border/15">
                        <Calendar size={18} className="text-gold-accent" />
                        <span className="text-sm text-text-secondary">
                          Stay duration: <strong>{priceDetails.nights} Nights</strong> ({new Date(checkInDate).toLocaleDateString()} to {new Date(checkOutDate).toLocaleDateString()})
                        </span>
                      </div>

                      {/* Food Options in Checkout (Only for Single Sharing Rooms) */}
                      {selectedRoom?.title?.toLowerCase().includes('single') && (
                        <div className="bg-emerald-50/40 border border-emerald-100 p-6 rounded-2xl space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-dark-forest">Customize Your Premium Food Plan</h4>
                            <p className="text-[11px] text-stone-500 mt-1">Select your meals below. Selected options will be added directly to your stay total.</p>
                          </div>
                          <div className="space-y-3">
                            {[
                              { 
                                id: 'breakfast', 
                                name: 'Breakfast (Tiffin)', 
                                price: 2000, 
                                description: 'Healthy and homemade morning tiffin, tea, and refreshments served hot.' 
                              },
                              { 
                                id: 'lunch', 
                                name: 'Lunch', 
                                price: 3500, 
                                description: 'Nutritious lunch with wholesome regional flavors and dynamic vegetarian/non-vegetarian gourmet choices.' 
                              },
                              { 
                                id: 'dinner', 
                                name: 'Dinner', 
                                price: 3500, 
                                description: 'Premium dinner balancing hygiene and exquisite taste, prepared with fresh local produce.' 
                              }
                            ].map(food => {
                              const isSelected = selectedFoodIds.includes(food.id);
                              // Pro-rated price calculation for display
                              const displayPrice = priceDetails.nights < 30 
                                ? Math.round((food.price / 30) * priceDetails.nights)
                                : food.price * Math.ceil(priceDetails.nights / 30);

                              return (
                                <div 
                                  key={food.id}
                                  onClick={() => handleCheckoutFoodToggle(food.id)}
                                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 bg-white ${
                                    isSelected 
                                      ? 'border-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent' 
                                      : 'border-border/30 hover:border-gold-accent/40'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-gold-accent text-white' : 'bg-stone-50 text-stone-400'}`}>
                                    <Check size={14} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                                  </div>
                                  <div className="flex-grow">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-dark-forest">{food.name}</span>
                                      <span className="text-xs font-semibold text-gold-accent">
                                        ₹{food.price}/mo <span className="text-[10px] text-stone-400 font-normal">(₹{displayPrice} for {priceDetails.nights} nights)</span>
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                                      {food.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 pt-2">
                        {/* Room Rate on Daily and Monthly Basis */}
                        <div className="p-4 rounded-xl bg-[#F7F5EF] border border-border/10 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-dark-forest">Suite Room Rate</span>
                            <span className="font-bold text-dark-forest">₹{priceDetails.baseAmount}</span>
                          </div>
                          <div className="flex justify-between text-xs text-text-secondary font-mono">
                            <span>Daily Basis: ₹{priceDetails.basePricePerNight}/day</span>
                            <span>Monthly Basis: ₹{priceDetails.basePricePerNight * 30}/month</span>
                          </div>
                        </div>

                        {priceDetails.extraGuestsAmount > 0 && (
                          <div className="flex justify-between text-sm px-1">
                            <span className="text-text-secondary">Extra Guest Charges ({priceDetails.nights} Nights)</span>
                            <span className="font-medium text-dark-forest">₹{priceDetails.extraGuestsAmount}</span>
                          </div>
                        )}

                        {/* Selected Food Rates on Monthly Basis */}
                        {priceDetails.foodAmount > 0 && (
                          <div className="p-4 rounded-xl bg-[#F7F5EF] border border-border/10 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-dark-forest">Food Subscription Rate</span>
                              <span className="font-bold text-dark-forest">₹{priceDetails.foodAmount}</span>
                            </div>
                            <div className="space-y-1">
                              {[
                                { id: 'breakfast', name: 'Breakfast (Tiffin)', price: 2000 },
                                { id: 'lunch', name: 'Lunch', price: 3500 },
                                { id: 'dinner', name: 'Dinner', price: 3500 }
                              ].filter(f => priceDetails.selectedFoodIds.includes(f.id)).map(food => (
                                <div key={food.id} className="flex justify-between text-xs text-text-secondary font-mono">
                                  <span>{food.name} Subscription</span>
                                  <span>₹{food.price}/month</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {priceDetails.discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-emerald-600 px-1 pt-1">
                            <span>Special Promo Discount ({priceDetails.discountPercent}%)</span>
                            <span>-₹{priceDetails.discountAmount}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-base font-bold text-dark-forest pt-3 border-t border-border/20 px-1">
                          <span>Stay Grand Total</span>
                          <span>₹{priceDetails.grandTotal}</span>
                        </div>

                        <div className="mt-6 p-5 bg-gold-accent/5 border border-gold-accent/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-center sm:text-left">
                            <span className="text-xs uppercase font-bold tracking-wider text-gold-accent font-button">Advance Required ({priceDetails.advancePercent}%)</span>
                            <p className="text-[10px] text-text-secondary mt-1">Pay advance to block and auto-confirm stay dates securely.</p>
                          </div>
                          <div className="font-heading font-bold text-2xl text-gold-accent">
                            ₹{priceDetails.advanceAmount}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 max-w-md">
                      <Button
                        onClick={() => setStep(4)}
                        variant="primary"
                        className="w-full sm:w-auto px-8 py-4 justify-center text-sm rounded-xl"
                      >
                        Proceed to Secure Checkout
                      </Button>
                      
                      <Button
                        onClick={() => setStep(2)}
                        variant="outline"
                        className="w-full sm:w-auto px-8 py-4 justify-center text-sm rounded-xl"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Razorpay Checkout Redirect / Loading Page */}
                {step === 4 && priceDetails && (
                  <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center animate-fadeIn">
                    <div className="w-16 h-16 bg-gold-accent/5 rounded-full flex items-center justify-center text-gold-accent">
                      <CreditCard size={28} />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-light text-dark-forest">Secure Payment Processing</h3>
                      <Paragraph className="text-text-secondary max-w-sm mx-auto">
                        We are launching the Razorpay payments overlay. Please pay ₹{priceDetails.advanceAmount} to confirm stay dates.
                      </Paragraph>
                    </div>

                    {paymentError && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs max-w-md mx-auto text-center font-medium font-sans space-y-3">
                        <p>{paymentError}</p>
                        <div className="pt-2 border-t border-red-200/50">
                          <p className="text-stone-600 text-[11px] font-normal mb-2 leading-relaxed">
                            Since Razorpay API credentials are not set on your deployed domain yet, you can bypass real payment and complete the reservation in <strong>Demo / Test Mode</strong>.
                          </p>
                          <Button
                            onClick={handleDemoBypass}
                            variant="primary"
                            className="w-full px-6 py-2.5 text-[11px] justify-center rounded-lg font-sans bg-amber-800 hover:bg-amber-900 border-none text-white shadow-md font-semibold tracking-wide uppercase"
                            disabled={paymentProcessing}
                          >
                            {paymentProcessing ? 'Processing Sandbox Booking...' : 'Bypass Payment & Confirm Stay'}
                          </Button>
                        </div>
                      </div>
                    )}
                    {/* Razorpay sandbox bypass helper only shown in case of error */}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto pt-4">
                      <Button
                        onClick={handlePayAdvance}
                        variant="primary"
                        className="w-full sm:w-auto px-8 py-3 text-xs justify-center rounded-xl font-sans"
                        disabled={paymentProcessing}
                      >
                        {paymentProcessing ? 'Processing Transaction...' : 'Launch Razorpay Modal'}
                      </Button>
                      
                      <Button
                        onClick={() => setStep(3)}
                        variant="outline"
                        className="w-full sm:w-auto px-8 py-3 text-xs justify-center rounded-xl font-sans"
                        disabled={paymentProcessing}
                      >
                        Back
                      </Button>
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        onClick={handleDemoBypass}
                        type="button"
                        className="text-stone-400 hover:text-gold-accent transition-colors text-[10px] font-medium tracking-wider uppercase underline underline-offset-4 cursor-pointer"
                        disabled={paymentProcessing}
                      >
                        Bypass to Complete Booking (Sandbox/Demo Mode)
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: Confirmation Screen */}
                {step === 5 && confirmedBooking && (
                  <div className="space-y-8 animate-fadeIn text-center">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Check size={32} />
                    </div>

                    <div className="space-y-2">
                      <Heading level={2} className="text-3xl font-light text-dark-forest">Stay Booking Confirmed!</Heading>
                      <Paragraph className="text-text-secondary">
                        Your luxury stay reference is <strong className="font-mono text-dark-forest">{confirmedBooking.bookingRef}</strong>.
                      </Paragraph>
                    </div>

                    <div className="border border-border/20 p-6 rounded-2xl space-y-4 text-sm text-left bg-stone-50/50 max-w-md mx-auto">
                      <div className="flex justify-between border-b border-border/10 pb-2">
                        <span className="text-text-secondary">Primary Guest</span>
                        <span className="font-semibold text-dark-forest">{confirmedBooking.firstName} {confirmedBooking.lastName}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/10 pb-2">
                        <span className="text-text-secondary">Suite category</span>
                        <span className="font-semibold text-dark-forest">{confirmedBooking.roomTitle}</span>
                      </div>
                      {confirmedBooking.roomNumber && (
                        <div className="flex justify-between border-b border-border/10 pb-2">
                          <span className="text-text-secondary">Assigned Suite</span>
                          <span className="font-semibold text-gold-accent">{confirmedBooking.floor} - Room {confirmedBooking.roomNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-border/10 pb-2">
                        <span className="text-text-secondary">Scheduled Date</span>
                        <span className="font-semibold text-dark-forest">{new Date(confirmedBooking.checkInDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/10 pb-2">
                        <span className="text-text-secondary">Total Nights</span>
                        <span className="font-semibold text-dark-forest">{confirmedBooking.numberOfNights} Nights</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Advance Paid (Razorpay)</span>
                        <span className="font-mono font-bold text-gold-accent">₹{confirmedBooking.advanceAmount}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-text-secondary max-w-xs mx-auto">
                      An email receipt with verification signature and WhatsApp check-in guidelines has been dispatched.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
                      <Button
                        onClick={() => navigate(`/booking/status?ref=${confirmedBooking.bookingRef}&phone=${confirmedBooking.phone}`)}
                        variant="primary"
                        className="w-full sm:w-auto px-8 py-3 text-xs justify-center rounded-xl"
                      >
                        Track Stay Live
                      </Button>
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="w-full sm:w-auto px-8 py-3 text-xs justify-center rounded-xl"
                      >
                        Return Home
                      </Button>
                    </div>
                  </div>
                )}

              </Card>
            </div>

            {/* Sidebar Stay summary */}
            {step < 5 && (
              <div className="lg:col-span-1">
                <Card hover={false} className="p-6 bg-stone-50 rounded-[28px] border border-border/25 space-y-6">
                  <h4 className="font-heading font-medium text-dark-forest border-b border-border/20 pb-3 text-base">Stay Summary</h4>

                  {selectedRoom ? (
                    <div className="space-y-5 text-sm">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
                        <img src={getDirectMediaUrl(selectedRoom.coverImage)} alt={selectedRoom.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-gold-accent font-semibold uppercase font-button">Selected suite</span>
                        <h5 className="font-heading font-medium text-dark-forest text-base leading-tight">{selectedRoom.title}</h5>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-border/20">
                        {checkInDate && (
                          <div className="flex justify-between text-xs">
                            <span className="text-text-secondary">Check-In</span>
                            <span className="font-semibold text-dark-forest">{new Date(checkInDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {checkOutDate && (
                          <div className="flex justify-between text-xs">
                            <span className="text-text-secondary">Check-Out</span>
                            <span className="font-semibold text-dark-forest">{new Date(checkOutDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Guests</span>
                          <span className="font-semibold text-dark-forest">{adultsCount} Guest{adultsCount > 1 ? 's' : ''}</span>
                        </div>
                        {selectedRoomNumber && (
                          <div className="flex justify-between text-xs">
                            <span className="text-text-secondary">Assigned Suite</span>
                            <span className="font-semibold text-gold-accent">{selectedFloor} - Room {selectedRoomNumber}</span>
                          </div>
                        )}
                      </div>

                      {priceDetails && (
                        <div className="border-t border-border/20 pt-4 text-xs space-y-2">
                          <div className="flex justify-between font-bold text-dark-forest">
                            <span>Stay Nights</span>
                            <span>{priceDetails.nights} Nights</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Base Rate Average</span>
                            <span>₹{priceDetails.basePricePerNight}/night</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-stone-400 space-y-3">
                      <Home size={40} className="mx-auto opacity-20" />
                      <p className="text-xs max-w-[200px] mx-auto">Select stay dates to view pricing details and reservation summary.</p>
                    </div>
                  )}

                </Card>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default BookingPage;
