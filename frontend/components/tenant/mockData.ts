// ─── Tenant Mock Data ────────────────────────────────────────────────────────

export interface TenantBooking {
    id: string;
    listingTitle: string;
    listingImage: string;
    address: string;
    landlordName: string;
    landlordAvatar: string;
    checkIn: string;
    checkOut: string;
    monthlyRent: number;
    status: "Active" | "Upcoming" | "Completed" | "Cancelled";
    roomType: string;
    floor: number;
    amenities: string[];
    nextPaymentDue?: string;
    depositPaid: number;
    totalPaid: number;
}

export interface TenantListing {
    id: string;
    title: string;
    address: string;
    city: string;
    price: number;
    imageUrl: string;
    beds: number;
    baths: number;
    sqft: number;
    rating: number;
    reviews: number;
    tags: string[];
    isFavorited: boolean;
    isVerified: boolean;
    postedDaysAgo: number;
    ownerName: string;
    ownerAvatar: string;
    description: string;
    amenities: string[];
}

export interface TenantMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    senderRole: "owner" | "tenant" | "admin";
    content: string;
    timestamp: string;
    timeAgo: string;
    isRead: boolean;
    listingTitle?: string;
}

export interface TenantConversation {
    id: string;
    participantName: string;
    participantAvatar: string;
    participantRole: "owner" | "admin";
    listingTitle: string;
    lastMessage: string;
    timeAgo: string;
    unreadCount: number;
    messages: TenantMessage[];
}

export interface TenantNotification {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: "booking" | "message" | "payment" | "system";
}

// ─── Bookings ────────────────────────────────────────────────────────────────
export const mockTenantBookings: TenantBooking[] = [
    {
        id: "bk-001",
        listingTitle: "Luxury Studio — DHA Phase 6",
        listingImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
        address: "House 47, Street 12, DHA Phase 6, Lahore",
        landlordName: "Zubair Khan",
        landlordAvatar: "https://i.pravatar.cc/150?img=52",
        checkIn: "2025-03-01",
        checkOut: "2025-08-31",
        monthlyRent: 45000,
        status: "Active",
        roomType: "Studio Apartment",
        floor: 3,
        amenities: ["WiFi", "AC", "Parking", "Generator", "Security", "CCTV"],
        nextPaymentDue: "2025-06-01",
        depositPaid: 90000,
        totalPaid: 225000,
    },
    {
        id: "bk-002",
        listingTitle: "Executive 2BR Suite — Gulberg III",
        listingImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
        address: "Apartment 5B, Gulberg III, Lahore",
        landlordName: "Fatima Malik",
        landlordAvatar: "https://i.pravatar.cc/150?img=44",
        checkIn: "2025-07-01",
        checkOut: "2026-06-30",
        monthlyRent: 75000,
        status: "Upcoming",
        roomType: "2-Bedroom Apartment",
        floor: 5,
        amenities: ["WiFi", "AC", "Parking", "Gym", "Pool", "Concierge"],
        nextPaymentDue: "2025-07-01",
        depositPaid: 150000,
        totalPaid: 150000,
    },
    {
        id: "bk-003",
        listingTitle: "Cozy 1BR — F-7 Islamabad",
        listingImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
        address: "Block D, F-7/4, Islamabad",
        landlordName: "Ahmed Raza",
        landlordAvatar: "https://i.pravatar.cc/150?img=68",
        checkIn: "2024-09-01",
        checkOut: "2025-02-28",
        monthlyRent: 35000,
        status: "Completed",
        roomType: "1-Bedroom Apartment",
        floor: 2,
        amenities: ["WiFi", "AC", "Elevator"],
        depositPaid: 70000,
        totalPaid: 280000,
    },
];

// ─── Listings / Browse ────────────────────────────────────────────────────────
export const mockBrowseListings: TenantListing[] = [
    {
        id: "ls-001",
        title: "Premium Studio — Bahria Town Phase 4",
        address: "Street 8, Bahria Town Phase 4",
        city: "Rawalpindi",
        price: 38000,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
        beds: 1,
        baths: 1,
        sqft: 650,
        rating: 4.9,
        reviews: 34,
        tags: ["Verified", "Available Now"],
        isFavorited: true,
        isVerified: true,
        postedDaysAgo: 2,
        ownerName: "Sara Mirza",
        ownerAvatar: "https://i.pravatar.cc/150?img=36",
        description: "A beautifully furnished studio with floor-to-ceiling windows and a breathtaking view of the park. Fully equipped kitchen, high-speed internet, and 24/7 security.",
        amenities: ["WiFi", "AC", "Parking", "Security", "Generator"],
    },
    {
        id: "ls-002",
        title: "Spacious 2BR — DHA Phase 5",
        address: "Block C, DHA Phase 5",
        city: "Lahore",
        price: 65000,
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
        beds: 2,
        baths: 2,
        sqft: 1100,
        rating: 4.7,
        reviews: 21,
        tags: ["Pet Friendly", "Furnished"],
        isFavorited: false,
        isVerified: true,
        postedDaysAgo: 5,
        ownerName: "Kamran Ali",
        ownerAvatar: "https://i.pravatar.cc/150?img=60",
        description: "Modern two-bedroom apartment in the heart of DHA. Open-plan living area, designer kitchen, and a private terrace. Ideal for couples or small families.",
        amenities: ["WiFi", "AC", "Parking", "Gym", "CCTV"],
    },
    {
        id: "ls-003",
        title: "Cozy 1BR Near Gulberg Market",
        address: "Garden Town, Gulberg",
        city: "Lahore",
        price: 30000,
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        beds: 1,
        baths: 1,
        sqft: 750,
        rating: 4.5,
        reviews: 18,
        tags: ["Students Welcome", "Near Metro"],
        isFavorited: false,
        isVerified: false,
        postedDaysAgo: 1,
        ownerName: "Nida Hassan",
        ownerAvatar: "https://i.pravatar.cc/150?img=32",
        description: "Charming one-bedroom apartment with walking distance to Gulberg Market and Liberty. Perfect for working professionals or students. Utilities included.",
        amenities: ["WiFi", "AC", "Elevator", "Laundry"],
    },
    {
        id: "ls-004",
        title: "Executive Penthouse — F-6/2 Islamabad",
        address: "Super Market, F-6/2",
        city: "Islamabad",
        price: 120000,
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
        beds: 3,
        baths: 3,
        sqft: 2400,
        rating: 5.0,
        reviews: 8,
        tags: ["Luxury", "Rooftop Access", "Verified"],
        isFavorited: true,
        isVerified: true,
        postedDaysAgo: 7,
        ownerName: "Tariq Jadoon",
        ownerAvatar: "https://i.pravatar.cc/150?img=12",
        description: "Exclusive penthouse with panoramic views of the Margalla Hills. Three bedrooms, designer bathrooms, a private cinema room and rooftop garden. Concierge service included.",
        amenities: ["WiFi", "AC", "Parking", "Gym", "Pool", "Concierge", "Cinema", "Rooftop"],
    },
    {
        id: "ls-005",
        title: "Minimalist Studio — Blue Area",
        address: "Jinnah Avenue, Blue Area",
        city: "Islamabad",
        price: 42000,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
        beds: 1,
        baths: 1,
        sqft: 550,
        rating: 4.6,
        reviews: 27,
        tags: ["Available Now", "Short Stay OK"],
        isFavorited: false,
        isVerified: true,
        postedDaysAgo: 3,
        ownerName: "Hina Butt",
        ownerAvatar: "https://i.pravatar.cc/150?img=47",
        description: "Sleek studio in the commercial heart of Islamabad. Fully furnished with smart appliances, fast internet and a dedicated workspace. Short-term stays welcome.",
        amenities: ["WiFi", "AC", "Security", "CCTV"],
    },
    {
        id: "ls-006",
        title: "Family 3BR — Bahria Town Karachi",
        address: "Precinct 15, Bahria Town",
        city: "Karachi",
        price: 55000,
        imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
        beds: 3,
        baths: 2,
        sqft: 1800,
        rating: 4.4,
        reviews: 13,
        tags: ["Family Friendly", "Gated Community"],
        isFavorited: false,
        isVerified: true,
        postedDaysAgo: 10,
        ownerName: "Bilal Qureshi",
        ownerAvatar: "https://i.pravatar.cc/150?img=75",
        description: "Spacious family home in Bahria Town's most prestigious precinct. Large garden, gated community with 24/7 security, and school nearby.",
        amenities: ["WiFi", "AC", "Parking", "Generator", "Security", "Garden"],
    },
];

// ─── Conversations / Inbox ────────────────────────────────────────────────────
export const mockTenantConversations: TenantConversation[] = [
    {
        id: "conv-001",
        participantName: "Zubair Khan",
        participantAvatar: "https://i.pravatar.cc/150?img=52",
        participantRole: "owner",
        listingTitle: "Luxury Studio — DHA Phase 6",
        lastMessage: "The maintenance team will be there by 10am tomorrow.",
        timeAgo: "3m ago",
        unreadCount: 2,
        messages: [
            { id: "m1", senderId: "owner", senderName: "Zubair Khan", senderAvatar: "https://i.pravatar.cc/150?img=52", senderRole: "owner", content: "Hi! Welcome to the property. Let me know if you need anything.", timestamp: "2025-05-01T09:00:00Z", timeAgo: "4 days ago", isRead: true },
            { id: "m2", senderId: "tenant", senderName: "Ali Hassan", senderAvatar: "https://i.pravatar.cc/150?img=25", senderRole: "tenant", content: "Thanks! The AC in the bedroom seems to not be working properly. Could you please send someone?", timestamp: "2025-05-04T14:30:00Z", timeAgo: "1 day ago", isRead: true },
            { id: "m3", senderId: "owner", senderName: "Zubair Khan", senderAvatar: "https://i.pravatar.cc/150?img=52", senderRole: "owner", content: "The maintenance team will be there by 10am tomorrow.", timestamp: "2025-05-05T18:00:00Z", timeAgo: "3m ago", isRead: false },
        ],
    },
    {
        id: "conv-002",
        participantName: "Fatima Malik",
        participantAvatar: "https://i.pravatar.cc/150?img=44",
        participantRole: "owner",
        listingTitle: "Executive 2BR Suite — Gulberg III",
        lastMessage: "The apartment will be ready for your move-in on July 1st.",
        timeAgo: "2h ago",
        unreadCount: 1,
        messages: [
            { id: "m4", senderId: "tenant", senderName: "Ali Hassan", senderAvatar: "https://i.pravatar.cc/150?img=25", senderRole: "tenant", content: "Hi Fatima, I'm very interested in the Gulberg apartment. Is it still available?", timestamp: "2025-05-03T10:00:00Z", timeAgo: "2 days ago", isRead: true },
            { id: "m5", senderId: "owner", senderName: "Fatima Malik", senderAvatar: "https://i.pravatar.cc/150?img=44", senderRole: "owner", content: "Yes! It's reserved for you. The apartment will be ready for your move-in on July 1st.", timestamp: "2025-05-05T16:00:00Z", timeAgo: "2h ago", isRead: false },
        ],
    },
    {
        id: "conv-003",
        participantName: "PG Nexus Support",
        participantAvatar: "https://i.pravatar.cc/150?img=9",
        participantRole: "admin",
        listingTitle: "Platform Inquiry",
        lastMessage: "Your identity verification has been approved!",
        timeAgo: "Yesterday",
        unreadCount: 0,
        messages: [
            { id: "m6", senderId: "admin", senderName: "PG Nexus Support", senderAvatar: "https://i.pravatar.cc/150?img=9", senderRole: "admin", content: "Your identity verification has been approved! You now have full access to all platform features.", timestamp: "2025-05-04T12:00:00Z", timeAgo: "Yesterday", isRead: true },
        ],
    },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const mockTenantNotifications: TenantNotification[] = [
    { id: "n1", title: "Rent Due Soon", description: "Your rent of PKR 45,000 is due on June 1st", time: "2 days", read: false, type: "payment" },
    { id: "n2", title: "New Message", description: "Zubair Khan sent you a message about maintenance", time: "3m ago", read: false, type: "message" },
    { id: "n3", title: "Booking Confirmed", description: "Your booking for Gulberg III has been confirmed", time: "2h ago", read: true, type: "booking" },
    { id: "n4", title: "Identity Verified", description: "Your CNIC has been verified successfully", time: "Yesterday", read: true, type: "system" },
];

// ─── Tenant Profile (for Identity/Preferences pages) ─────────────────────────
export const mockTenantProfile = {
    id: "t-001",
    name: "Ali Hassan",
    email: "ali.hassan@gmail.com",
    phone: "+92 300 1234567",
    avatarUrl: "https://i.pravatar.cc/150?img=25",
    cnic: "35202-1234567-1",
    cnicVerified: true,
    joinedDate: "April 2024",
    city: "Lahore",
    occupation: "Software Engineer",
    company: "Tech Corp Lahore",
    preferredCities: ["Lahore", "Islamabad"],
    budget: { min: 25000, max: 70000 },
    preferences: {
        roomType: "Studio / 1BR",
        furnished: true,
        petsAllowed: false,
        smokingAllowed: false,
        internet: true,
        parking: true,
        gym: false,
    },
    points: 3850,
    tier: "Silver",
};
