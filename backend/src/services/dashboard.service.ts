import { prisma } from "../config/prisma.js";

export const getOwnerDashboardStats = async (userId: string) => {
    const rooms = await prisma.room.findMany({
        where: { owner_id: userId },
        include: { _count: { select: { saved_by_users: true, bookings: true } } },
    });

    const activeRooms = rooms.filter(r => r.status === "active").length;
    const pendingRooms = rooms.filter(r => r.status === "pending").length;
    const rejectedRooms = rooms.filter(r => r.status === "rejected").length;
    const totalViews = rooms.reduce((acc, r) => acc + (r.views ?? 0), 0);
    const totalSaved = rooms.reduce((acc, r) => acc + r._count.saved_by_users, 0);
    const totalInquiries = rooms.reduce((acc, r) => acc + r._count.bookings, 0);

    const points = await prisma.pointsTransaction.aggregate({
        where: { owner_id: userId },
        _sum: { points: true },
    });

    return {
        stats: {
            totalViews,
            totalSaved,
            totalInquiries,
            totalPoints: points._sum.points || 0,
        },
        listingCounts: {
            active: activeRooms,
            pending: pendingRooms,
            rejected: rejectedRooms,
            total: rooms.length,
        },
        recentInquiries: await prisma.booking.findMany({
            where: { room: { owner_id: userId } },
            orderBy: { created_at: "desc" },
            take: 4,
            include: {
                tenant: { select: { full_name: true, profile_photo_url: true, email: true } },
                room: { select: { id: true, title: true } },
            },
        }),
    };
};

export const getAdminDashboardStats = async () => {
    const [totalUsers, activeListings, pendingListings, pendingReports, totalOwners, totalTenants] = await Promise.all([
        prisma.user.count(),
        prisma.room.count({ where: { status: "active" } }),
        prisma.room.count({ where: { status: "pending" } }),
        prisma.report.count({ where: { status: "pending" } }),
        prisma.user.count({ where: { role: "owner" } }),
        prisma.user.count({ where: { role: "tenant" } }),
    ]);

    const recentActivity = await prisma.adminAction.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        include: { admin: { select: { full_name: true } } },
    });

    return {
        stats: {
            totalUsers,
            totalOwners,
            totalTenants,
            activeListings,
            pendingListings,
            pendingReports,
        },
        recentActivity,
    };
};

export const getTenantDashboardStats = async (userId: string) => {
    const [savedCount, bookingCount] = await Promise.all([
        prisma.savedRoom.count({ where: { user_id: userId } }),
        prisma.booking.count({ where: { tenant_id: userId } }),
    ]);

    const activeBookings = await prisma.booking.findMany({
        where: { tenant_id: userId, status: { in: ["approved", "active", "pending"] } },
        include: {
            room: {
                include: {
                    images: { take: 1 },
                    owner: { select: { id: true, full_name: true, profile_photo_url: true } },
                },
            },
        },
        orderBy: { created_at: "desc" },
        take: 3,
    });

    return {
        stats: {
            savedCount,
            bookingCount,
        },
        activeBookings,
    };
};
