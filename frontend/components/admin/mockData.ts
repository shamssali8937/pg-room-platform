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
