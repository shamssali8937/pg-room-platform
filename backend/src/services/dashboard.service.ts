import { prisma } from "../config/prisma.js";

export const getOwnerDashboardStats = async (userId: string) => {
    const rooms = await prisma.room.findMany({
        where: { owner_id: userId },
        include: { _count: { select: { saved_by_users: true, bookings: true } } },
    });

    const activeRooms = rooms.filter(r => r.status === "approved").length;
    const pendingRooms = rooms.filter(r => r.status === "pending").length;
    const totalViews = 0; // Requires a view counter in the schema
    const totalSaved = rooms.reduce((acc, r) => acc + r._count.saved_by_users, 0);
    const totalInquiries = rooms.reduce((acc, r) => acc + r._count.bookings, 0);

    const points = await prisma.pointsTransaction.aggregate({
        where: { owner_id: userId },
        _sum: { points: true },
    });

    return {
        stats: {
            totalViews, // placeholder
            totalSaved,
            totalInquiries,
            totalPoints: points._sum.points || 0,
        },
        listingCounts: {
            active: activeRooms,
            pending: pendingRooms,
            total: rooms.length,
        },
        recentInquiries: await prisma.booking.findMany({
            where: { room: { owner_id: userId } },
            orderBy: { created_at: "desc" },
            take: 4,
            include: { tenant: { select: { full_name: true, profile_photo_url: true } } }
        })
    };
};

export const getAdminDashboardStats = async () => {
    const totalUsers = await prisma.user.count();
    const activeListings = await prisma.room.count({ where: { status: "approved" } });
    const pendingListings = await prisma.room.count({ where: { status: "pending" } });
    const pendingReports = await prisma.report.count({ where: { status: "pending" } });

    const recentActivity = await prisma.adminAction.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        include: { admin: { select: { full_name: true } } }
    });

    return {
        stats: {
            totalUsers,
            activeListings,
            pendingListings,
            pendingReports,
        },
        recentActivity
    };
};

export const getTenantDashboardStats = async (userId: string) => {
    const savedCount = await prisma.savedRoom.count({ where: { user_id: userId } });
    const bookingCount = await prisma.booking.count({ where: { tenant_id: userId } });
    const activeBookings = await prisma.booking.findMany({
        where: { tenant_id: userId, status: { in: ["approved", "active"] } },
        include: { room: true }
    });

    return {
        stats: {
            savedCount,
            bookingCount,
        },
        activeBookings
    };
};
