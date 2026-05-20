export interface OwnerInquiry {
    id: string;
    name: string;
    timeAgo: string;
    message: string;
    status: 'New' | 'Replied';
    reference?: string;
    avatarUrl: string;
    property: string;
    priority?: 'High' | 'Normal';
}

export interface ChatMessage {
    id: string;
    sender: 'tenant' | 'owner';
    text: string;
    time: string;
}

export interface DocumentStatus {
    name: string;
    status: "verified" | "pending" | "failed";
}

export interface OwnerListing {
    id: string;
    title: string;
    price: number;
    priceUnit: string;
    status: 'Live' | 'Pending Review' | 'Rejected';
    featured?: boolean;
    boosted?: boolean;
    location: string;
    beds: number;
    baths: number;
    imageUrl: string;
    gallery?: string[];
    roomType?: string;
    capacity?: number;
    occupancy?: number;
    description?: string;
    amenities?: string[];
    documents?: DocumentStatus[];
    currency?: string;
    views?: number;
    inquiries?: number;
    rejectionReason?: string;
}

export interface WalletTransaction {
    id: string;
    date: string;
    action: string;
    sub: string;
    type: 'Earned' | 'Spent';
    status: 'Completed' | 'Active' | 'Expired';
    amount: number;
}

export const mockOwnerListings: OwnerListing[] = [
    {
        id: "LST-8901",
        title: "Executive 2BR Penthouse",
        price: 85000,
        priceUnit: "/mo",
        currency: "PKR",
        status: "Live",
        featured: true,
        boosted: true,
        location: "Phase 6, DHA Lahore",
        beds: 2,
        baths: 2,
        roomType: "Entire Apartment",
        capacity: 4,
        occupancy: 85,
        views: 2841,
        inquiries: 18,
        description: "A stunning 2-bedroom executive penthouse offering panoramic city views. Features modern minimalist architecture, a fully equipped chef's kitchen, floor-to-ceiling windows, and premium imported fittings.",
        amenities: ["WiFi", "AC", "Parking", "Kitchen", "Gym", "Power Backup", "CCTV", "Housekeeping"],
        documents: [
            { name: "Property Deed", status: "verified" },
            { name: "Owner CNIC", status: "verified" },
            { name: "Utility Bill", status: "verified" }
        ],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAoqFDY75KGWhB2Ptdh7qonaXMiLCX_oWNgOH8H6PG9SD-LFf0eSSZtXNlmbTpTh8edjt4hrROkNXsWNoiCW_NhEJE79qUve_zXvKpD3ip03Ab-WiVQ1qsVvJunkmAss3M0jCEiqp0IzhUYbUgvQY2-JjlJh5D08Fl4T5bRIg8Icj2RNvexKuL7DBipUxgXlhkdgqUyIG5lN0DafSAfMz4YQVsxdbXv4VtIFRxRHkDVfjdbwl8l5LltFwR58jFntlG0xzGoSjvPA",
        gallery: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAAoqFDY75KGWhB2Ptdh7qonaXMiLCX_oWNgOH8H6PG9SD-LFf0eSSZtXNlmbTpTh8edjt4hrROkNXsWNoiCW_NhEJE79qUve_zXvKpD3ip03Ab-WiVQ1qsVvJunkmAss3M0jCEiqp0IzhUYbUgvQY2-JjlJh5D08Fl4T5bRIg8Icj2RNvexKuL7DBipUxgXlhkdgqUyIG5lN0DafSAfMz4YQVsxdbXv4VtIFRxRHkDVfjdbwl8l5LltFwR58jFntlG0xzGoSjvPA",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCId5PObyypcjF08_jo5jZilD6LLRa-bnhkvuxpOgM7CADnzVDMJLIbh4C4nBuemLApcLg2YFsRcY4qhOO_z1LoMOv7CMJ8WzP9Bkd5KaCR_OC3QNYB1yN3q0gTgklL1cNZeqnhRwQTyqh1nRTxeu2kozxOeqhL0D6RJp0GCIF_XpMweH4LkSLddnmgrRIorgev_3WUeQYfHH2-7bgoR6QV29MZgJhSGNc2o0KbAMgWQ4nHJPMF8AttcgdmtD_KyPkwdCqERyURpQ"
        ]
    },
    {
        id: "LST-8902",
        title: "Seaside Luxury Studio",
        price: 120000,
        priceUnit: "/mo",
        currency: "PKR",
        status: "Pending Review",
        location: "Block 4, Clifton Karachi",
        beds: 1,
        baths: 1,
        roomType: "Studio Apartment",
        capacity: 2,
        occupancy: 0,
        views: 0,
        inquiries: 0,
        description: "Wake up to the sound of waves in this beautiful seaside studio. Perfect for singles or couples, this space boasts an open-plan living area, a sea-facing balcony, and premium modern furnishings.",
        amenities: ["WiFi", "AC", "Parking", "Kitchen", "Pool", "CCTV", "Terrace", "Housekeeping"],
        documents: [
            { name: "Property Deed", status: "verified" },
            { name: "Owner CNIC", status: "pending" }
        ],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCId5PObyypcjF08_jo5jZilD6LLRa-bnhkvuxpOgM7CADnzVDMJLIbh4C4nBuemLApcLg2YFsRcY4qhOO_z1LoMOv7CMJ8WzP9Bkd5KaCR_OC3QNYB1yN3q0gTgklL1cNZeqnhRwQTyqh1nRTxeu2kozxOeqhL0D6RJp0GCIF_XpMweH4LkSLddnmgrRIorgev_3WUeQYfHH2-7bgoR6QV29MZgJhSGNc2o0KbAMgWQ4nHJPMF8AttcgdmtD_KyPkwdCqERyURpQ",
        gallery: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCId5PObyypcjF08_jo5jZilD6LLRa-bnhkvuxpOgM7CADnzVDMJLIbh4C4nBuemLApcLg2YFsRcY4qhOO_z1LoMOv7CMJ8WzP9Bkd5KaCR_OC3QNYB1yN3q0gTgklL1cNZeqnhRwQTyqh1nRTxeu2kozxOeqhL0D6RJp0GCIF_XpMweH4LkSLddnmgrRIorgev_3WUeQYfHH2-7bgoR6QV29MZgJhSGNc2o0KbAMgWQ4nHJPMF8AttcgdmtD_KyPkwdCqERyURpQ"
        ]
    },
    {
        id: "LST-8903",
        title: "Mountain View Retreat",
        price: 65000,
        priceUnit: "/mo",
        currency: "PKR",
        status: "Rejected",
        location: "Murree Hills, Punjab",
        beds: 3,
        baths: 2,
        roomType: "Entire Villa",
        capacity: 6,
        occupancy: 0,
        views: 0,
        inquiries: 0,
        rejectionReason: "High-resolution photography required. The current assets do not meet our curation standards for the Elite tier.",
        amenities: ["WiFi", "Fireplace", "Kitchen", "Parking", "Garden"],
        documents: [
            { name: "Property Deed", status: "failed" },
            { name: "Owner CNIC", status: "verified" }
        ],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAB1MOsnIo_NvIJv__V6N2UwImlnLKJLX_-Le7p6JB3bA5bMOsygZwGwlBzUqnqOjBmU0ufSbuY6BNAAvTvtcWBXgnozjzO7jxaKTgDK2MD1zMvoshOg0FUaL2VdzsJm4FrULQZecp0AIeAUQd4hBCdNvR60Krej2AFNl6Y1riQWGnX-GIS_wvEKxPgU9D8TP4mYrAUtPpMVPcQyKoXci6g_US1Mlz2nfgL0ybY_MOV9IJHnxjODc4q1PoFTthiQC6DG816g_uvWg",
        gallery: []
    }
];

export const mockOwnerInquiries: OwnerInquiry[] = [
    {
        id: "1",
        name: "Sara Ahmed",
        timeAgo: "2m ago",
        message: "Is the penthouse still available for viewing this weekend?",
        status: "New",
        reference: "DHA Penthouse",
        property: "Executive 2BR Penthouse",
        priority: "High",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC03tU5kizc64Mag0lS7QfiC_jEC5dl4FdREWkFGp6vPQO70zPBYDZOOiQoIdei63F_3_7hsKuRaV5vXykhzVhSyAq0px7IQQGCjiEx2VaiLOA4dNfgPA3UnfPRoQ1g_9I3UmoeCi8Zg_7N5pMvvfSt7mxhDwMDWp3ONXiur2rSnIVXwP7gxG1ruymSLBwwHcAsZKMFl67q7kFe1vQUWQqJz_375TrSsIjeNyew0WMx5I_nuGeDyGndlwhuek08PIaBqNCxcAvK6A"
    },
    {
        id: "2",
        name: "Kamran Shah",
        timeAgo: "1h ago",
        message: "I am interested in the studio. What are the deposit requirements?",
        status: "Replied",
        property: "Seaside Luxury Studio",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuArcAZ6PzRjh_2jlG51OBOPbydDL6fzU5ILVuRJ2h8TQHsb1UQ9gK3b5ZArU1MPXxIaJE2p7ovxQaLo74O-FxMu69YYiyFDLSDX9oGPuA5LteYSH_j-_iXtx4V3ofb_ou9YLI_9I1OrHQgKOzh7EsYutgNqla41nAw7NpLhW8mQyr-U_Ut_kNI0aT1LKdUI3C1HbaHFZbibpthCIs13h12RRMBcaoDwZmmusdQ8Vur0_TUT5FnvLjUyQuonF7b2M5Jh75RQ-qjV1A"
    },
    {
        id: "3",
        name: "Fatima Zehra",
        timeAgo: "3h ago",
        message: "Can we negotiate the rent for a long-term contract of 2 years?",
        status: "Replied",
        property: "Executive 2BR Penthouse",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrLTP8MLUJyIEGE0BtXgW9kkB2k7ap1j1Hxd2TQNbYKNdbK8R8eCc1waQmP1WHOjMo0SXCkpz-a6xAVFt02Ui8gMGcPuDjI5dBMkc8jaWcxJmDDlCx7wHgA0x_s_ceMpadROKP9tUz1I0qRJF10lHFKNx3njsp8IXNBHGV7ot5BRC34br5SerU5U5kgTBI6U5P_Pzsn8LPgJtODTEBSPUmZVkfNwYy1q01c867xAhsXWy4XZqDDvMlcy78rzE-tFJT4IYx_H0gXw"
    },
    {
        id: "4",
        name: "Dr. Arshad",
        timeAgo: "5h ago",
        message: "Looking for a quiet place for my clinic staff nearby.",
        status: "New",
        property: "Seaside Luxury Studio",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxU_yKFVPcYZ9Se1dUZIfMwaRLgFTuaedvVnavmLr09zGxuNMM-FkwVmvBQgERuyRCtPK-2D5G67UjITSBOJ-0pjJAZDGiQsbPjQAKdq-WpaCBG6jlF5AVVj8EvlAXtxW6eDZs5QIuEO44ZD6wjZDu0aZLU_T1vmd1NarNTi8IDFig5FVwByP8uh_RvtDxRdkmtvOhwAdcklH7oN9m6qkhiMKsV-w7JazYGSxYBeNy0sJaHTgJEiUA_VurXymT368q1cCHanJb7Q"
    }
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
    "1": [
        { id: "m1", sender: "tenant", text: "Hello! I just finished reviewing the listing for the Executive Penthouse. It looks stunning!", time: "10:14 AM" },
        { id: "m2", sender: "tenant", text: "Is the property still available for a viewing this Saturday or Sunday?", time: "10:15 AM" },
        { id: "m3", sender: "owner", text: "Hello Sara, absolutely! The penthouse is available for a private showing. Saturday afternoon works perfectly. I'll have our concierge prepare the unit.", time: "10:22 AM" },
        { id: "m4", sender: "tenant", text: "That's wonderful, thank you so much! Looking forward to it.", time: "10:25 AM" },
    ],
    "2": [
        { id: "m1", sender: "tenant", text: "Hi, I am very interested in the Seaside Luxury Studio.", time: "Yesterday" },
        { id: "m2", sender: "tenant", text: "Could you please let me know what the deposit requirements are?", time: "Yesterday" },
        { id: "m3", sender: "owner", text: "Hi Kamran! The deposit is equivalent to 2 months rent. We require the first month upfront plus the deposit to secure the unit.", time: "Yesterday" },
    ],
    "3": [
        { id: "m1", sender: "tenant", text: "Good evening. I have been looking at the Executive Penthouse and I love it.", time: "3h ago" },
        { id: "m2", sender: "tenant", text: "I am considering a 2-year contract. Would there be any flexibility on the monthly rent?", time: "3h ago" },
    ],
    "4": [
        { id: "m1", sender: "tenant", text: "Hello, I am Dr. Arshad. I am looking for accommodations for my clinic staff.", time: "5h ago" },
        { id: "m2", sender: "tenant", text: "We need a quiet, professional environment near the Clifton area. Is your studio suitable?", time: "5h ago" },
    ]
};

export const mockWalletTransactions: WalletTransaction[] = [
    { id: "t1", date: "Oct 24, 2023", action: "Listing Approval Bonus", sub: "Property ID: #LST-8901", type: "Earned", status: "Completed", amount: 1200 },
    { id: "t2", date: "Oct 22, 2023", action: "Premium Boost: 7 Days", sub: "Applied to: Executive 2BR Penthouse", type: "Spent", status: "Active", amount: -500 },
    { id: "t3", date: "Oct 18, 2023", action: "Quality Bonus (5★ Reviews)", sub: "Tenant Satisfaction Multiplier", type: "Earned", status: "Completed", amount: 450 },
    { id: "t4", date: "Oct 12, 2023", action: "Featured Placement", sub: "Main Landing Page Carousel", type: "Spent", status: "Expired", amount: -800 },
    { id: "t5", date: "Oct 05, 2023", action: "New Listing Reward", sub: "Property ID: #LST-8902", type: "Earned", status: "Completed", amount: 300 },
    { id: "t6", date: "Sep 28, 2023", action: "Newsletter Feature", sub: "Curator's Choice — 15k Subscribers", type: "Spent", status: "Completed", amount: -820 },
];
