export interface OwnerInquiry {
    id: string;
    name: string;
    timeAgo: string;
    message: string;
    status: 'New' | 'Replied';
    reference?: string;
    avatarUrl: string;
}

export const mockOwnerInquiries: OwnerInquiry[] = [
    {
        id: "1",
        name: "Sara Ahmed",
        timeAgo: "2m ago",
        message: "Is the penthouse still available for viewing this weekend?",
        status: "New",
        reference: "DHA Penthouse",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuALQnuTgyrr3ExVhSf-cohwnb3C9CIhpWzUekc5AQtHVwPCNHIwekbJHCBSh3MX6INxGlYgJ6wQQm7N4vBCGPbjolx2zul9O1X02Dyt9HrOjwyaBOLycWjLbZYjFwA_aK0dcm96PsQ7tWUf9anea6ogvNFnYi-b55fsg0cSIDnq6Pe1GeZPAPonhs623QDE9StaPxzPE84OUbjz2kFLrQMbMrJdxpDNMauLDPFM1oK9xpfdwaCtok-VJWIE3GbQ4PtXSolRYDXeFA"
    },
    {
        id: "2",
        name: "Kamran Shah",
        timeAgo: "1h ago",
        message: "I am interested in the studio. What are the deposit requirements?",
        status: "Replied",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJk1IxG3J1e-Zwqoi_gbDBGZkNW09WeumS79_7iPTB92y89YhuqPACCZBVusV9ROLQV1V1q7scUgX69mzC1vfurIzqk5dudVJVD4K3jOkMVw1-Da7L76HU44ypcUMg6JrAWxLiLd_gmPGOA6JQudVMAG4ra2xPaC_JpAm9WQURDhNRay3QWBDroPiTRMPIHe2CdNdURTfeN2FW-SUM7ATlTlex-YnQPGXcU_931or3E78b7bwgF68XFqSHyV-PnN0TkfuqVxHRaA"
    },
    {
        id: "3",
        name: "Fatima Zehra",
        timeAgo: "3h ago",
        message: "Can we negotiate the rent for a long-term contract of 2 years?",
        status: "Replied",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrLTP8MLUJyIEGE0BtXgW9kkB2k7ap1j1Hxd2TQNbYKNdbK8R8eCc1waQmP1WHOjMo0SXCkpz-a6xAVFt02Ui8gMGcPuDjI5dBMkc8jaWcxJmDDlCx7wHgA0x_s_ceMpadROKP9tUz1I0qRJF10lHFKNx3njsp8IXNBHGV7ot5BRC34br5SerU5U5kgTBI6U5P_Pzsn8LPgJtODTEBSPUmZVkfNwYy1q01c867xAhsXWy4XZqDDvMlcy78rzE-tFJT4IYx_H0gXw"
    },
    {
        id: "4",
        name: "Dr. Arshad",
        timeAgo: "5h ago",
        message: "Looking for a quiet place for my clinic staff nearby.",
        status: "New",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxU_yKFVPcYZ9Se1dUZIfMwaRLgFTuaedvVnavmLr09zGxuNMM-FkwVmvBQgERuyRCtPK-2D5G67UjITSBOJ-0pjJAZDGiQsbPjQAKdq-WpaCBG6jlF5AVVj8EvlAXtxW6eDZs5QIuEO44ZD6wjZDu0aZLU_T1vmd1NarNTi8IDFig5FVwByP8uh_RvtDxRdkmtvOhwAdcklH7oN9m6qkhiMKsV-w7JazYGSxYBeNy0sJaHTgJEiUA_VurXymT368q1cCHanJb7Q"
    }
];

export interface DocumentStatus {
    name: string;
    status: "verified" | "pending" | "failed";
}

export interface OwnerListing {
    id: string;
    title: string;
    price: number;
    priceUnit: string;
    status: 'Live' | 'Pending Review';
    featured?: boolean;
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
        location: "Phase 6, DHA Lahore",
        beds: 2,
        baths: 2,
        roomType: "Entire Apartment",
        capacity: 4,
        occupancy: 85,
        description: "A stunning 2-bedroom executive penthouse offering panoramic city views. Features modern minimalist architecture, a fully equipped chef's kitchen, floor-to-ceiling windows, and premium imported fittings. Situated in a highly secure and serene block of DHA Lahore.",
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
        description: "Wake up to the sound of waves in this beautiful seaside studio. Perfect for singles or couples, this space boasts an open-plan living area, a sea-facing balcony, and premium modern furnishings.",
        amenities: ["WiFi", "AC", "Parking", "Kitchen", "Pool", "CCTV", "Terrace", "Housekeeping"],
        documents: [
            { name: "Property Deed", status: "verified" },
            { name: "Owner CNIC", status: "pending" }
        ],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCId5PObyypcjF08_jo5jZilD6LLRa-bnhkvuxpOgM7CADnzVDMJLIbh4C4nBuemLApcLg2YFsRcY4qhOO_z1LoMOv7CMJ8WzP9Bkd5KaCR_OC3QNYB1yN3q0gTgklL1cNZeqnhRwQTyqh1nRTxeu2kozxOeqhL0D6RJp0GCIF_XpMweH4LkSLddnmgrRIorgev_3WUeQYfHH2-7bgoR6QV29MZgJhSGNc2o0KbAMgWQ4nHJPMF8AttcgdmtD_KyPkwdCqERyURpQ",
        gallery: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCId5PObyypcjF08_jo5jZilD6LLRa-bnhkvuxpOgM7CADnzVDMJLIbh4C4nBuemLApcLg2YFsRcY4qhOO_z1LoMOv7CMJ8WzP9Bkd5KaCR_OC3QNYB1yN3q0gTgklL1cNZeqnhRwQTyqh1nRTxeu2kozxOeqhL0D6RJp0GCIF_XpMweH4LkSLddnmgrRIorgev_3WUeQYfHH2-7bgoR6QV29MZgJhSGNc2o0KbAMgWQ4nHJPMF8AttcgdmtD_KyPkwdCqERyURpQ",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAAoqFDY75KGWhB2Ptdh7qonaXMiLCX_oWNgOH8H6PG9SD-LFf0eSSZtXNlmbTpTh8edjt4hrROkNXsWNoiCW_NhEJE79qUve_zXvKpD3ip03Ab-WiVQ1qsVvJunkmAss3M0jCEiqp0IzhUYbUgvQY2-JjlJh5D08Fl4T5bRIg8Icj2RNvexKuL7DBipUxgXlhkdgqUyIG5lN0DafSAfMz4YQVsxdbXv4VtIFRxRHkDVfjdbwl8l5LltFwR58jFntlG0xzGoSjvPA"
        ]
    }
];
