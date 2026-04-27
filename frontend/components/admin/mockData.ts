// Mock data for admin dashboard - replace with API calls later

export interface Listing {
    id: string;
    title: string;
    owner: string;
    location: string;
    country: string;
    rent: string;
    rentNum: number;
    submitted: string;
    image: string;
    status: "pending" | "approved" | "rejected";
}

export interface ModerationReport {
    id: string;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    reportedBy: string;
}

export interface PointsActivity {
    id: string;
    type: "earned" | "spent" | "reward";
    amount: number;
    user: string;
    reason: string;
    icon: string;
}

export interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
}

export const mockListings: Listing[] = [
    {
        id: "lst-001",
        title: "The Penthouse at DHA V",
        owner: "Hassan K.",
        location: "Lahore",
        country: "PK",
        rent: "PKR 145,000",
        rentNum: 145000,
        submitted: "Oct 12, 11:30 PM",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop",
        status: "pending",
    },
    {
        id: "lst-002",
        title: "Margalla View Studio",
        owner: "Sara J.",
        location: "Islamabad",
        country: "PK",
        rent: "PKR 85,000",
        rentNum: 85000,
        submitted: "Oct 12, 09:15 PM",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop",
        status: "pending",
    },
    {
        id: "lst-003",
        title: "Clifton Seaview Suite",
        owner: "Bilal M.",
        location: "Karachi",
        country: "PK",
        rent: "PKR 210,000",
        rentNum: 210000,
        submitted: "Oct 11, 04:45 PM",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop",
        status: "pending",
    },
    {
        id: "lst-004",
        title: "Bahria Town Villa",
        owner: "Ali R.",
        location: "Rawalpindi",
        country: "PK",
        rent: "PKR 120,000",
        rentNum: 120000,
        submitted: "Oct 10, 02:00 PM",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=200&fit=crop",
        status: "pending",
    },
    {
        id: "lst-005",
        title: "Gulberg Luxury Flat",
        owner: "Fatima N.",
        location: "Lahore",
        country: "PK",
        rent: "PKR 95,000",
        rentNum: 95000,
        submitted: "Oct 10, 11:20 AM",
        image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=200&h=200&fit=crop",
        status: "pending",
    },
];

export const mockModerationReports: ModerationReport[] = [
    {
        id: "mod-001",
        title: "Flagged: Duplicate Listing",
        description: "Reported by User @nexus_alpha",
        severity: "high",
        reportedBy: "@nexus_alpha",
    },
    {
        id: "mod-002",
        title: "User: Harassment Report",
        description: "Inquiry regarding Chat ID #892",
        severity: "medium",
        reportedBy: "@sarah_k",
    },
    {
        id: "mod-003",
        title: "Price Manipulation",
        description: "Automated system flag - Listing #991",
        severity: "low",
        reportedBy: "system",
    },
];

export const mockPointsActivity: PointsActivity[] = [
    {
        id: "pts-001",
        type: "earned",
        amount: 250,
        user: "Ayesha Khan",
        reason: "Premium Subscription",
        icon: "star",
    },
    {
        id: "pts-002",
        type: "spent",
        amount: -100,
        user: "Zain Malik",
        reason: "Featured Boost",
        icon: "shopping-bag",
    },
    {
        id: "pts-003",
        type: "reward",
        amount: 50,
        user: "Omer Farooq",
        reason: "Accurate Reporting",
        icon: "shield",
    },
];

export const mockNotifications: Notification[] = [
    {
        id: "notif-001",
        title: "New Listing Submitted",
        description: "The Penthouse at DHA V needs review",
        time: "2 min ago",
        read: false,
    },
    {
        id: "notif-002",
        title: "User Report Filed",
        description: "Harassment report on Chat #892",
        time: "15 min ago",
        read: false,
    },
    {
        id: "notif-003",
        title: "System Alert",
        description: "Price manipulation detected on Listing #991",
        time: "1 hour ago",
        read: true,
    },
    {
        id: "notif-004",
        title: "Points Redeemed",
        description: "Zain Malik redeemed 100 points",
        time: "3 hours ago",
        read: true,
    },
];

export const mockStats = {
    activeListings: { value: 1284, change: 12 },
    pendingApprovals: { value: 42, label: "New Entries" },
    reportedItems: { value: 8, label: "Action Required" },
    activeUsers: { value: 8920, label: "Live Now" },
};

// ── User Management ──────────────────────────────────────────

export type UserRole = "Owner" | "Tenant";
export type VerificationStatus = "Verified" | "Pending" | "Rejected";
export type AccountStatus = "Active" | "Warned" | "Suspended";

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: UserRole;
    verification: VerificationStatus;
    accountStatus: AccountStatus;
    joinDate: string;
}

export const mockUsers: AdminUser[] = [
    {
        id: "usr-001",
        name: "Eleanor Vance",
        email: "eleanor.v@nexus.io",
        avatar: "https://i.pravatar.cc/100?img=5",
        role: "Owner",
        verification: "Verified",
        accountStatus: "Active",
        joinDate: "Oct 12, 2023",
    },
    {
        id: "usr-002",
        name: "Julian Thorne",
        email: "julian.t@nexus.io",
        avatar: "https://i.pravatar.cc/100?img=8",
        role: "Tenant",
        verification: "Pending",
        accountStatus: "Warned",
        joinDate: "Dec 04, 2023",
    },
    {
        id: "usr-003",
        name: "Arthur Sterling",
        email: "sterling@corp.com",
        avatar: "https://i.pravatar.cc/100?img=11",
        role: "Owner",
        verification: "Verified",
        accountStatus: "Suspended",
        joinDate: "Jan 15, 2024",
    },
    {
        id: "usr-004",
        name: "Seraphina Moon",
        email: "s.moon@gmail.com",
        avatar: "https://i.pravatar.cc/100?img=9",
        role: "Tenant",
        verification: "Verified",
        accountStatus: "Active",
        joinDate: "Feb 02, 2024",
    },
    {
        id: "usr-005",
        name: "Khalid Rahman",
        email: "k.rahman@outlook.com",
        avatar: "https://i.pravatar.cc/100?img=14",
        role: "Owner",
        verification: "Pending",
        accountStatus: "Active",
        joinDate: "Mar 18, 2024",
    },
    {
        id: "usr-006",
        name: "Amara Osei",
        email: "amara.o@nexus.io",
        avatar: "https://i.pravatar.cc/100?img=25",
        role: "Tenant",
        verification: "Verified",
        accountStatus: "Warned",
        joinDate: "Apr 05, 2024",
    },
    {
        id: "usr-007",
        name: "Dimitri Volkov",
        email: "d.volkov@mail.ru",
        avatar: "https://i.pravatar.cc/100?img=33",
        role: "Owner",
        verification: "Rejected",
        accountStatus: "Suspended",
        joinDate: "May 22, 2024",
    },
    {
        id: "usr-008",
        name: "Lina Chen",
        email: "lina.c@tech.co",
        avatar: "https://i.pravatar.cc/100?img=32",
        role: "Tenant",
        verification: "Verified",
        accountStatus: "Active",
        joinDate: "Jun 10, 2024",
    },
    {
        id: "usr-009",
        name: "Hassan Mirza",
        email: "h.mirza@pg.pk",
        avatar: "https://i.pravatar.cc/100?img=51",
        role: "Owner",
        verification: "Verified",
        accountStatus: "Active",
        joinDate: "Jul 01, 2024",
    },
    {
        id: "usr-010",
        name: "Priya Sharma",
        email: "priya.s@inbox.in",
        avatar: "https://i.pravatar.cc/100?img=44",
        role: "Tenant",
        verification: "Pending",
        accountStatus: "Active",
        joinDate: "Aug 19, 2024",
    },
];

// ── Listing Moderation ───────────────────────────────────────

export type ModerationStatus = "pending" | "approved" | "suspended" | "audit";

export interface ModerationListing {
    id: string;
    title: string;
    image: string;
    price: number;
    currency: string;
    location: string;
    host: {
        name: string;
        avatar: string;
        badge: string;
        detail: string;
    };
    status: ModerationStatus;
    flagReason?: string;
    auditNote?: string;
    propertyCount?: number;
    // Rich detail fields
    description?: string;
    amenities?: string[];
    gallery?: string[];
    roomType?: string;
    capacity?: number;
    documents?: { name: string; status: "verified" | "pending" | "failed" }[];
    submittedAt?: string;
    occupancy?: number;
}

export const rejectionReasons = [
    "Blurry / Low-Quality Images",
    "Incomplete Address",
    "Price Mismatch with Market",
    "Policy Violation",
    "Duplicate Listing",
    "Suspicious Account Activity",
    "Missing Amenity Photos",
    "Inaccurate Description",
];

export const mockModerationListings: ModerationListing[] = [
    {
        id: "PG-9902",
        title: "Azure Skies Residency",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
        price: 24500,
        currency: "PKR",
        location: "Gulberg III, Lahore",
        host: {
            name: "Vikram Malhotra",
            avatar: "https://i.pravatar.cc/100?img=3",
            badge: "Host",
            detail: "Joined June 2023",
        },
        status: "pending",
        description: "A stunning modern apartment in the heart of Gulberg III with panoramic city views. Features floor-to-ceiling windows, Italian marble flooring, and smart home automation throughout.",
        amenities: ["WiFi", "AC", "Parking", "Laundry", "Kitchen", "CCTV", "Power Backup", "Gym"],
        gallery: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
        ],
        roomType: "Single Occupancy",
        capacity: 2,
        documents: [
            { name: "Property Registration", status: "verified" },
            { name: "Utility Bill", status: "pending" },
            { name: "Owner ID Proof", status: "verified" },
        ],
        submittedAt: "Apr 25, 2026 • 11:30 PM",
        occupancy: 78,
    },
    {
        id: "PG-8821",
        title: "The Heritage Suites",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
        price: 32000,
        currency: "PKR",
        location: "DHA Phase 5, Lahore",
        host: {
            name: "Ananya Sharma",
            avatar: "https://i.pravatar.cc/100?img=5",
            badge: "Superhost",
            detail: "4.9 Rating",
        },
        status: "approved",
        description: "Boutique-style heritage accommodation with velvet textures and warm wooden interiors. Located near DHA's commercial hub with easy metro access.",
        amenities: ["WiFi", "AC", "Parking", "Kitchen", "Hot Water", "Housekeeping", "Study Room"],
        gallery: [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop",
        ],
        roomType: "Double Sharing",
        capacity: 4,
        documents: [
            { name: "Property Registration", status: "verified" },
            { name: "Utility Bill", status: "verified" },
            { name: "Owner ID Proof", status: "verified" },
        ],
        submittedAt: "Mar 10, 2026 • 09:15 AM",
        occupancy: 92,
    },
    {
        id: "PG-7704",
        title: "Cozy Den PG",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
        price: 12000,
        currency: "PKR",
        location: "I-8 Markaz, Islamabad",
        host: {
            name: "Bilal Ahmed",
            avatar: "https://i.pravatar.cc/100?img=11",
            badge: "Host",
            detail: "Joined Jan 2024",
        },
        status: "suspended",
        flagReason: "Flagged for duplicate listing violation",
        description: "Affordable studio apartment in the quiet I-8 sector. Clean, minimal interiors with essential amenities for students and young professionals.",
        amenities: ["WiFi", "AC", "Hot Water", "Laundry"],
        gallery: [
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop",
        ],
        roomType: "Triple Sharing",
        capacity: 6,
        documents: [
            { name: "Property Registration", status: "failed" },
            { name: "Utility Bill", status: "pending" },
            { name: "Owner ID Proof", status: "verified" },
        ],
        submittedAt: "Feb 18, 2026 • 04:45 PM",
        occupancy: 45,
    },
    {
        id: "PG-6633",
        title: "Emerald Heights Luxury",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop",
        price: 65000,
        currency: "PKR",
        location: "Clifton Block 9, Karachi",
        host: {
            name: "Rajesh Koothrappali",
            avatar: "https://i.pravatar.cc/100?img=14",
            badge: "Corporation Host",
            detail: "14 Properties",
        },
        status: "audit",
        auditNote:
            "Verification failed on owner-submitted documents. Utility bill name does not match property registration ID.",
        description: "Grand luxury villa with private garden, rooftop lounge, and concierge service. Targets corporate executives and diplomatic staff.",
        amenities: ["WiFi", "AC", "Parking", "Kitchen", "Pool", "Gym", "Concierge", "Rooftop", "CCTV", "Power Backup"],
        gallery: [
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop",
        ],
        roomType: "Entire Unit",
        capacity: 2,
        documents: [
            { name: "Property Registration", status: "verified" },
            { name: "Utility Bill", status: "failed" },
            { name: "Owner ID Proof", status: "pending" },
            { name: "Corporate License", status: "pending" },
        ],
        submittedAt: "Apr 02, 2026 • 02:00 PM",
        occupancy: 60,
    },
    {
        id: "PG-5501",
        title: "Skyline Studio Flats",
        image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&h=400&fit=crop",
        price: 18500,
        currency: "PKR",
        location: "Bahria Town, Rawalpindi",
        host: {
            name: "Fatima Noor",
            avatar: "https://i.pravatar.cc/100?img=9",
            badge: "Host",
            detail: "Joined Mar 2024",
        },
        status: "pending",
        description: "Modern studio flats in the gated community of Bahria Town. Each unit features modular furniture, high-speed internet, and 24/7 security.",
        amenities: ["WiFi", "AC", "Parking", "CCTV", "Power Backup", "Laundry"],
        gallery: [
            "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
        ],
        roomType: "Single Occupancy",
        capacity: 1,
        documents: [
            { name: "Property Registration", status: "verified" },
            { name: "Utility Bill", status: "verified" },
            { name: "Owner ID Proof", status: "pending" },
        ],
        submittedAt: "Apr 24, 2026 • 08:20 AM",
        occupancy: 55,
    },
    {
        id: "PG-4420",
        title: "Margalla View Terrace",
        image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop",
        price: 45000,
        currency: "PKR",
        location: "F-7 Markaz, Islamabad",
        host: {
            name: "Sara Jamal",
            avatar: "https://i.pravatar.cc/100?img=25",
            badge: "Superhost",
            detail: "4.8 Rating",
        },
        status: "approved",
        description: "Premium terrace accommodation with breathtaking Margalla Hills views. Features designer interiors, organic breakfast service, and dedicated workspace.",
        amenities: ["WiFi", "AC", "Parking", "Kitchen", "Terrace", "Study Room", "Breakfast", "Housekeeping"],
        gallery: [
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=500&fit=crop",
        ],
        roomType: "Double Sharing",
        capacity: 3,
        documents: [
            { name: "Property Registration", status: "verified" },
            { name: "Utility Bill", status: "verified" },
            { name: "Owner ID Proof", status: "verified" },
        ],
        submittedAt: "Jan 28, 2026 • 10:00 AM",
        occupancy: 88,
    },
    {
        id: "PG-3309",
        title: "Palm Residency Elite",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
        price: 28000,
        currency: "PKR",
        location: "Johar Town, Lahore",
        host: {
            name: "Omer Farooq",
            avatar: "https://i.pravatar.cc/100?img=33",
            badge: "Host",
            detail: "Joined Sep 2023",
        },
        status: "audit",
        auditNote:
            "Multiple guest complaints regarding amenity mismatch. Listed amenities not found during virtual inspection.",
        description: "Upscale PG with claimed premium amenities in Lahore's academic hub. Currently under review for reported discrepancies between listing and reality.",
        amenities: ["WiFi", "AC", "Parking", "Kitchen", "Gym", "Pool"],
        gallery: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
        ],
        roomType: "Single Occupancy",
        capacity: 3,
        documents: [
            { name: "Property Registration", status: "verified" },
            { name: "Utility Bill", status: "pending" },
            { name: "Owner ID Proof", status: "verified" },
        ],
        submittedAt: "Mar 15, 2026 • 06:30 PM",
        occupancy: 30,
    },
    {
        id: "PG-2208",
        title: "Seaside Comfort Inn",
        image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop",
        price: 15500,
        currency: "PKR",
        location: "Defence View, Karachi",
        host: {
            name: "Ali Raza",
            avatar: "https://i.pravatar.cc/100?img=51",
            badge: "Host",
            detail: "Joined Nov 2023",
        },
        status: "suspended",
        flagReason: "Price manipulation detected — inconsistent pricing across platforms",
        description: "Budget-friendly accommodation near Karachi's coast. Suspended due to pricing inconsistency discovered during cross-platform audit.",
        amenities: ["WiFi", "AC", "Hot Water"],
        gallery: [
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=500&fit=crop",
        ],
        roomType: "Triple Sharing",
        capacity: 6,
        documents: [
            { name: "Property Registration", status: "pending" },
            { name: "Utility Bill", status: "failed" },
            { name: "Owner ID Proof", status: "verified" },
        ],
        submittedAt: "Apr 10, 2026 • 03:15 PM",
        occupancy: 20,
    },
];

// ── Reports & Appeals ────────────────────────────────────────

export type ReportPriority = "high" | "medium" | "low";
export type ReportCategory = "scam" | "harassment" | "inaccurate" | "spam" | "other";
export type ReportTab = "active" | "archived" | "appeals";

export interface AdminReport {
    id: string;
    target: {
        name: string;
        type: "listing" | "user" | "chat";
        avatar: string;
        subLabel: string;
    };
    reason: ReportCategory;
    priority: ReportPriority;
    time: string;
    status: "open" | "resolved" | "escalated";
    reportedBy: string;
    description?: string;
    evidence?: string[];
}

export const reportCategoryLabels: Record<ReportCategory, string> = {
    scam: "Scam",
    harassment: "Harassment",
    inaccurate: "Inaccurate Info",
    spam: "Spam",
    other: "Other",
};

export const mockAdminReports: AdminReport[] = [
    {
        id: "RP-9421",
        target: {
            name: "Skyline Penthouse 4B",
            type: "listing",
            avatar: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop",
            subLabel: "Listing Violation",
        },
        reason: "scam",
        priority: "high",
        time: "12 mins ago",
        status: "open",
        reportedBy: "@nexus_alpha",
        description: "Suspicious watermark detected. Property images appear to be stolen from a real estate agency.",
        evidence: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
        ],
    },
    {
        id: "RP-8812",
        target: {
            name: "Julian Rivers",
            type: "user",
            avatar: "https://i.pravatar.cc/100?img=8",
            subLabel: "User Behavior",
        },
        reason: "harassment",
        priority: "medium",
        time: "45 mins ago",
        status: "open",
        reportedBy: "@sarah_k",
        description: "Repeated abusive messages in chat thread #892. Screenshots attached.",
    },
    {
        id: "RP-7704",
        target: {
            name: "Azure Estate Villa",
            type: "listing",
            avatar: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=100&h=100&fit=crop",
            subLabel: "Listing Violation",
        },
        reason: "inaccurate",
        priority: "low",
        time: "2 hours ago",
        status: "open",
        reportedBy: "@user_224",
        description: "Listed amenities do not match actual property. Pool is listed but property has no pool.",
    },
    {
        id: "RP-6512",
        target: {
            name: "Direct Chat Link",
            type: "chat",
            avatar: "",
            subLabel: "Chat Content",
        },
        reason: "scam",
        priority: "high",
        time: "4 hours ago",
        status: "open",
        reportedBy: "system",
        description: "Automated system detected external payment link sharing in chat messages.",
    },
    {
        id: "RP-5403",
        target: {
            name: "Premium Studio F6",
            type: "listing",
            avatar: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=100&h=100&fit=crop",
            subLabel: "Listing Violation",
        },
        reason: "spam",
        priority: "medium",
        time: "6 hours ago",
        status: "open",
        reportedBy: "@mod_team",
        description: "Duplicate listing detected. Same property posted with different pricing.",
    },
    {
        id: "RP-4301",
        target: {
            name: "Hassan Mirza",
            type: "user",
            avatar: "https://i.pravatar.cc/100?img=51",
            subLabel: "User Behavior",
        },
        reason: "other",
        priority: "low",
        time: "1 day ago",
        status: "resolved",
        reportedBy: "@user_887",
        description: "User is unresponsive to booking confirmations. Multiple guests reported no-shows.",
    },
    {
        id: "RP-3200",
        target: {
            name: "Emerald Heights",
            type: "listing",
            avatar: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop",
            subLabel: "Appeal Request",
        },
        reason: "inaccurate",
        priority: "medium",
        time: "2 days ago",
        status: "escalated",
        reportedBy: "@owner_raj",
        description: "Owner appealing suspension. Claims listing was accurate and provides counter-evidence.",
    },
];

export const mockReportStats = {
    openReports: { value: 142, change: "+12% from yesterday" },
    avgResolution: { value: "4.2h", label: "Within target SLA" },
    pendingAppeals: { value: 28, label: "High priority queue" },
    trustScore: { value: "98.4%", label: "Platform stability high" },
};

// ── Points Ledger ────────────────────────────────────────────

export type PointAction = "earned" | "spent" | "manual" | "reward" | "penalty";

export interface PointTransaction {
    id: string;
    user: {
        name: string;
        uid: string;
        avatar: string;
    };
    action: string;
    type: PointAction;
    delta: number;
    balance: number;
    timestamp: string;
    status: "verified" | "auto-debit" | "manual" | "pending" | "reversed";
}

export const mockPointTransactions: PointTransaction[] = [
    {
        id: "TXN-001",
        user: { name: "Julian Vance", uid: "99420-XV", avatar: "https://i.pravatar.cc/100?img=3" },
        action: "Listing Approval Bonus",
        type: "earned",
        delta: 500,
        balance: 12450,
        timestamp: "Apr 27, 2026 • 14:22:10",
        status: "verified",
    },
    {
        id: "TXN-002",
        user: { name: "Elena Sterling", uid: "82103-LQ", avatar: "https://i.pravatar.cc/100?img=5" },
        action: "Priority Boost Purchase",
        type: "spent",
        delta: -1200,
        balance: 4820,
        timestamp: "Apr 27, 2026 • 12:45:33",
        status: "auto-debit",
    },
    {
        id: "TXN-003",
        user: { name: "Marcus Thorne", uid: "11054-MT", avatar: "https://i.pravatar.cc/100?img=14" },
        action: "Manual Admin Adjustment",
        type: "manual",
        delta: 2500,
        balance: 15000,
        timestamp: "Apr 27, 2026 • 09:12:00",
        status: "manual",
    },
    {
        id: "TXN-004",
        user: { name: "Liam Croft", uid: "44921-LC", avatar: "https://i.pravatar.cc/100?img=33" },
        action: "Featured Slot (3 Days)",
        type: "spent",
        delta: -5000,
        balance: 22140,
        timestamp: "Apr 26, 2026 • 18:55:40",
        status: "verified",
    },
    {
        id: "TXN-005",
        user: { name: "Fatima Noor", uid: "55312-FN", avatar: "https://i.pravatar.cc/100?img=9" },
        action: "Superhost Reward",
        type: "reward",
        delta: 1000,
        balance: 8300,
        timestamp: "Apr 26, 2026 • 15:30:00",
        status: "verified",
    },
    {
        id: "TXN-006",
        user: { name: "Ali Raza", uid: "78201-AR", avatar: "https://i.pravatar.cc/100?img=51" },
        action: "Policy Violation Penalty",
        type: "penalty",
        delta: -3000,
        balance: 1200,
        timestamp: "Apr 26, 2026 • 11:00:00",
        status: "verified",
    },
    {
        id: "TXN-007",
        user: { name: "Sara Jamal", uid: "61445-SJ", avatar: "https://i.pravatar.cc/100?img=25" },
        action: "Referral Bonus",
        type: "earned",
        delta: 750,
        balance: 9850,
        timestamp: "Apr 25, 2026 • 20:10:22",
        status: "verified",
    },
    {
        id: "TXN-008",
        user: { name: "Omer Farooq", uid: "33890-OF", avatar: "https://i.pravatar.cc/100?img=11" },
        action: "Listing Renewal Fee",
        type: "spent",
        delta: -200,
        balance: 3600,
        timestamp: "Apr 25, 2026 • 08:45:15",
        status: "auto-debit",
    },
];

export const mockPointsStats = {
    totalEarned: { value: 42850, label: "pts" },
    totalSpent: { value: 28120, label: "pts" },
    netDelta: { value: 14730 },
    systemHealth: {
        autoApprovals: 92,
        adminManual: 4,
        boostUtilization: 28,
    },
};
