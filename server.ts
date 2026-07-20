import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit, 
  writeBatch 
} from "firebase/firestore";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Firebase Client SDK on the server side to connect securely using the API key
const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "").trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "").trim(),
  projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "").trim(),
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || "").trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "").trim(),
  measurementId: (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.VITE_FIREBASE_MEASUREMENT_ID || "").trim(),
};

let clientApp;
if (getApps().length === 0) {
  clientApp = initializeApp(firebaseConfig);
} else {
  clientApp = getApp();
}
const db = getFirestore(clientApp);

// Initialize Razorpay lazily to avoid crashing on startup if keys are missing
function getRazorpayKeyId(): string {
  return (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();
}

function getRazorpayKeySecret(): string {
  return (process.env.RAZORPAY_KEY_SECRET || "").trim();
}

let razorpayInstance: Razorpay | null = null;
function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const keyId = getRazorpayKeyId();
    const keySecret = getRazorpayKeySecret();
    
    // Use fallbacks to prevent crashing at initialization if environment variables are missing
    razorpayInstance = new Razorpay({
      key_id: keyId || "rzp_test_placeholder",
      key_secret: keySecret || "placeholder_secret",
    });
  }
  return razorpayInstance;
}

// Helper: Securely retrieve pricing rules from Firestore using client SDK
async function getPricingRules(roomId: string) {
  const defaultRules = {
    roomId,
    basePrice: 4500,
    weekendPrice: 5500,
    holidayPrice: 6500,
    extraAdultPrice: 1500,
    extraChildPrice: 750,
    discountPercent: 0,
    taxesPercent: 12,
    cleaningFee: 500,
    platformFee: 200,
    securityDeposit: 3000,
    advancePercent: 50,
    minimumStay: 1,
    maximumStay: 30,
    cancellationWindow: 24,
    refundRules: "Cancel before 24 hours of check-in for a full refund."
  };

  try {
    const pricingRulesCol = collection(db, "pricingRules");
    const q = query(pricingRulesCol, where("roomId", "==", roomId), limit(1));
    const snap = await getDocs(q);
      
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
    }

    const qGlobal = query(pricingRulesCol, where("roomId", "==", "global"), limit(1));
    const snapGlobal = await getDocs(qGlobal);
      
    if (!snapGlobal.empty) {
      return { id: snapGlobal.docs[0].id, ...snapGlobal.docs[0].data(), roomId } as any;
    }

    return defaultRules;
  } catch (err) {
    console.error("[Server] Error fetching pricing rules:", err);
    return defaultRules;
  }
}

// Helper: Fetch Room details securely from Firestore
async function getRoomTitle(roomId: string): Promise<string> {
  try {
    const docRef = doc(db, "rooms", roomId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()?.title || "Selected Room";
    }
  } catch (err) {
    console.error("[Server] Error fetching room title:", err);
  }
  return "Selected Room";
}

// Secure live price calculations on the server side
async function calculateServerLivePrice(
  roomId: string,
  checkIn: string,
  checkOut: string,
  adultsCount: number,
  childrenCount: number,
  selectedFoodIds: string[] = []
) {
  const rules = await getPricingRules(roomId);
  
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  let baseAmount = 0;
  let extraGuestsAmount = 0;
  
  const current = new Date(start);
  for (let i = 0; i < nights; i++) {
    const dayOfWeek = current.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday and Saturday night stay

    let rate = rules.basePrice;
    if (isWeekend) {
      rate = rules.weekendPrice || rules.basePrice;
    }
    baseAmount += rate;

    // Extra guest calculations (base capacity assumed 2 adults)
    const extraAdults = Math.max(0, adultsCount - 2);
    const extraChildren = childrenCount;
    extraGuestsAmount += (extraAdults * rules.extraAdultPrice) + (extraChildren * rules.extraChildPrice);

    current.setDate(current.getDate() + 1);
  }

  // Food calculation: monthly/daily rate based on stay length
  let foodAmount = 0;
  const foodOptions = [
    { id: "breakfast", price: 2000 },
    { id: "tiffin", price: 2000 },
    { id: "lunch", price: 3500 },
    { id: "dinner", price: 3500 }
  ];

  if (selectedFoodIds && selectedFoodIds.length > 0) {
    selectedFoodIds.forEach(id => {
      const option = foodOptions.find(o => o.id === id);
      if (option) {
        // If stay is less than a month, we charge per day (monthly/30 * nights)
        // If stay is exactly a month or more, we charge monthly blocks
        if (nights < 30) {
          foodAmount += Math.round((option.price / 30) * nights);
        } else {
          const months = Math.ceil(nights / 30);
          foodAmount += option.price * months;
        }
      }
    });
  }

  const rawSubtotal = baseAmount + extraGuestsAmount + foodAmount;
  const discountAmount = Math.round(rawSubtotal * (rules.discountPercent / 100));
  const subtotalAfterDiscount = rawSubtotal - discountAmount;

  // Overriding fees to 0 as requested by the user / aligned with client
  const taxesPercent = 0;
  const taxesAmount = 0;
  const cleaningFee = 0;
  const platformFee = 0;
  const securityDeposit = 0;
  
  const grandTotal = subtotalAfterDiscount;
  const advanceAmount = Math.round(grandTotal * (rules.advancePercent / 100));

  return {
    nights,
    basePricePerNight: rules.basePrice,
    baseAmount,
    extraGuestsAmount,
    foodAmount,
    selectedFoodIds,
    discountPercent: rules.discountPercent,
    discountAmount,
    taxesPercent,
    taxesAmount,
    cleaningFee,
    platformFee,
    securityDeposit,
    grandTotal,
    advanceAmount,
    advancePercent: rules.advancePercent,
  };
}

// API Routes
app.post("/api/create-order", async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, adultsCount, childrenCount, selectedFoodIds, receipt } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: "Missing required booking specifications." });
    }

    // 1. Securely calculate live price directly on the server side
    const priceDetails = await calculateServerLivePrice(
      roomId,
      checkInDate,
      checkOutDate,
      adultsCount || 2,
      childrenCount || 0,
      selectedFoodIds || []
    );

    const amountInPaise = Math.round(priceDetails.advanceAmount * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({ error: "Minimum payment amount is 100 paise (1 INR)." });
    }

    // 2. Open standard Razorpay Order creation request
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(options);
    
    return res.json({
      key_id: getRazorpayKeyId(),
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      priceDetails // Return securely calculated details to the frontend
    });
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    
    let userFriendlyMessage = "Internal Server Error in creating order";
    if (error?.statusCode === 401 || error?.error?.description === "Authentication failed" || (error?.message && error.message.includes("401"))) {
      userFriendlyMessage = "Razorpay Authentication failed. Please double-check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the .env file. Ensure there are no spaces or trailing characters, and that the key is generated in Test Mode.";
    } else if (error?.error?.description) {
      userFriendlyMessage = `Razorpay Error: ${error.error.description}`;
    } else if (error?.message) {
      userFriendlyMessage = `Razorpay Error: ${error.message}`;
    }

    return res.status(error?.statusCode || 500).json({ 
      error: "Razorpay Error", 
      message: userFriendlyMessage 
    });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      bookingPayload 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingPayload) {
      return res.status(400).json({ error: "Missing required verification fields." });
    }

    // 1. Re-calculate hash using HMAC-SHA256 with key secret
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", getRazorpayKeySecret())
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("Razorpay Signature Verification Failed:", { expectedSignature, razorpay_signature });
      return res.status(400).json({ 
        error: "Signature mismatch. Invalid transaction signature detected." 
      });
    }

    // 2. Securely recalculate price details on the server to double-verify with booking payload
    const securePrices = await calculateServerLivePrice(
      bookingPayload.roomId,
      bookingPayload.checkInDate,
      bookingPayload.checkOutDate,
      bookingPayload.adultsCount,
      bookingPayload.childrenCount,
      bookingPayload.selectedFoodOptions || []
    );

    // Assert that the advanceAmount matches securely calculated server value
    if (Math.abs(securePrices.advanceAmount - bookingPayload.advanceAmount) > 1) {
      return res.status(400).json({
        error: "Price tampering detected. Calculated advance does not match paid order amount."
      });
    }

    // 3. Batch write to Firestore using Web SDK
    const batch = writeBatch(db);
    const roomTitle = await getRoomTitle(bookingPayload.roomId);

    const bookingRequestsCol = collection(db, "bookingRequests");
    const finalBookingId = bookingPayload.id || doc(bookingRequestsCol).id;
    const verifiedBookingPayload = {
      ...bookingPayload,
      id: finalBookingId,
      roomTitle,
      baseAmount: securePrices.baseAmount,
      extraGuestsAmount: securePrices.extraGuestsAmount,
      taxesAmount: securePrices.taxesAmount,
      cleaningFee: securePrices.cleaningFee,
      platformFee: securePrices.platformFee,
      securityDeposit: securePrices.securityDeposit,
      discountAmount: securePrices.discountAmount,
      grandTotal: securePrices.grandTotal,
      advanceAmount: securePrices.advanceAmount,
      paymentStatus: "paid",
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentDetails: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        paidAt: new Date().toISOString()
      }
    };

    // Set verified booking request
    const bookingRefDoc = doc(db, "bookingRequests", finalBookingId);
    batch.set(bookingRefDoc, verifiedBookingPayload);

    // Set payments ledger doc
    const paymentsCol = collection(db, "payments");
    const paymentDocId = doc(paymentsCol).id;
    const paymentPayload = {
      bookingId: finalBookingId,
      bookingRef: bookingPayload.bookingRef,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      amount: securePrices.advanceAmount,
      currency: "INR",
      status: "paid",
      timestamp: new Date().toISOString()
    };
    batch.set(doc(db, "payments", paymentDocId), paymentPayload);

    // Set booking history log
    const historyCol = collection(db, "bookingHistory");
    const historyDocId = doc(historyCol).id;
    const historyPayload = {
      bookingId: finalBookingId,
      bookingRef: bookingPayload.bookingRef,
      action: "Stay Reserved & Advance Paid",
      performedBy: "customer",
      notes: `Stay confirmed with INR ${securePrices.advanceAmount} advance payment. Razorpay ID: ${razorpay_payment_id}`,
      timestamp: new Date().toISOString()
    };
    batch.set(doc(db, "bookingHistory", historyDocId), historyPayload);

    await batch.commit();

    return res.json({ 
      status: "success", 
      message: "Payment verified and booking written securely to Firestore.",
      booking: verifiedBookingPayload
    });
  } catch (error: any) {
    console.error("Razorpay Payment Verification Error:", error);
    return res.status(500).json({ 
      error: "Internal Server Error in verifying payment", 
      message: error?.message || String(error) 
    });
  }
});

// Vite & Static file serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Explicitly serve index.html for any admin paths first to bypass directory lookup or trailing slash conflicts
    app.get(["/admin", "/admin/*"], (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Botanical Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
