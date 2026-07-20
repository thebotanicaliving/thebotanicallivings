export const Hotel = {
  name: "Botanical Living",
  shortName: "Botanical Living",
  tagline: "A Premium Botanical Sanctuary for Mindful Living",
  slogan: "Live Better. Live Botanical.",
  description: "Premium co-living spaces in Kondapur, Hyderabad, designed for comfortable and convenient long stays for working professionals.",
  
  location: {
    landmark: "Botanical Garden Road",
    locality: "Sri Ram Nagar",
    area: "Kondapur",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500084",
    googleMaps: "https://maps.app.goo.gl/A5sof44phwiS8qSw5",
    fullAddress: "715B, B Block, Plot No. 714, Botanical Garden Road, Sri Ram Nagar, Kondapur, Hyderabad, Telangana 500084",
    nearbyPlaces: [
      { name: "Botanical Garden", distance: "200m" },
      { name: "HITEC City", distance: "2.5km" },
      { name: "Raidurg Metro", distance: "3.5km" },
      { name: "Sarath City Capital Mall", distance: "1.5km" },
      { name: "Wipro", distance: "4.5km" },
      { name: "Microsoft", distance: "5km" },
      { name: "Deloitte", distance: "3.5km" },
      { name: "Infosys", distance: "5km" }
    ]
  },

  contact: {
    phone: "+91 9966471719",
    whatsapp: "+91 9966471719",
    email: "stay@thebotanicallivings.com",
    website: "https://thebotanicallivings.com",
    businessHours: "9:00 AM - 9:00 PM"
  },

  accommodation: {
    roomTypes: [
      {
        id: "single-sharing",
        name: "Single Sharing",
        basePrice: 27000,
        features: ["Attached Washroom", "Study Table", "Wardrobe", "Storage", "Comfortable Bed", "High Speed WiFi"]
      },
      {
        id: "two-sharing",
        name: "Two Sharing",
        basePrice: 17000,
        features: ["Attached Washroom", "Study Table", "Wardrobe", "Storage", "Comfortable Beds", "High Speed WiFi"]
      }
    ],
    foodOptions: [
      { id: "breakfast", name: "Breakfast (Tiffin)", price: 2000, description: "Daily fresh South Indian & continental breakfast" },
      { id: "lunch", name: "Lunch", price: 3500, description: "Homely afternoon meals (Veg/Non-Veg options)" },
      { id: "dinner", name: "Dinner", price: 3500, description: "Satisfying evening meals with regional variety" }
    ]
  },

  amenities: [
    { id: "wifi", name: "High Speed WiFi", icon: "Wifi" },
    { id: "security", name: "24/7 CCTV Surveillance", icon: "Shield" },
    { id: "power", name: "24/7 Power Backup", icon: "Zap" },
    { id: "housekeeping", name: "Daily Housekeeping", icon: "Brush" },
    { id: "laundry", name: "Free Laundry", icon: "Waves" },
    { id: "ironing", name: "Free Ironing", icon: "Wind" },
    { id: "meals", name: "Homely Meals", icon: "Utensils" },
    { id: "water", name: "RO Water", icon: "Droplets" },
    { id: "lift", name: "Lift", icon: "ArrowUpSquare" },
    { id: "parking", name: "Parking", icon: "Car" },
    { id: "tv", name: "TV", icon: "Tv" },
    { id: "ac", name: "AC", icon: "AirVent" },
    { id: "dining", name: "Modern Dining Hall", icon: "ChefHat" },
    { id: "cafe", name: "Botanical Café", icon: "Coffee" }
  ],

  cafe: {
    name: "Botanical Café",
    description: "Our signature rooftop space designed for deep focus and better conversations.",
    highlights: ["Rooftop Café", "Great Food", "Great Views", "Better Conversations", "Work Friendly", "Evening Ambience"]
  }
};
