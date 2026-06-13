import { prisma } from "../config/prisma.js";
import { getOrSet } from "../utils/cache.js";

export const getOwnerDashboardStats = async (userId: string) => {
    return getOrSet(`dashboard:owner:${userId}`, 300, async () => {
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
    }); // end getOrSet
};

export const getAdminDashboardStats = async () => {
    return getOrSet("dashboard:admin", 120, async () => {
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

    const pendingReportsList = await prisma.report.findMany({
        where: { status: "pending" },
        orderBy: { created_at: "desc" },
        take: 5,
        include: { reporter: { select: { full_name: true } } },
    });

    const pointsTxList = await prisma.pointsTransaction.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        include: {
            owner: { select: { full_name: true } },
            room: { select: { title: true } },
        },
    });

    const mappedReports = pendingReportsList.map(r => ({
        id: r.id,
        title: `${r.target_type.toUpperCase()} reported`,
        description: `${r.reason_code}: ${r.description || "No description"} (by ${r.reporter?.full_name ?? "Anonymous"})`,
        severity: r.reason_code.toLowerCase().includes("spam") || r.reason_code.toLowerCase().includes("fake") ? "medium" : "high",
    }));

    const mappedPointsActivity = pointsTxList.map(tx => ({
        id: tx.id,
        amount: tx.points,
        type: tx.points > 0 ? "earned" : "spent",
        user: tx.owner?.full_name ?? "Owner",
        reason: `${tx.reason_code}${tx.room ? ` (${tx.room.title})` : ""}`,
        icon: tx.points > 0 ? "star" : "shopping-bag",
    }));

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
        recentReports: mappedReports,
        recentPointsActivity: mappedPointsActivity,
    };
    }); // end getOrSet
};

export const getTenantDashboardStats = async (userId: string) => {
    return getOrSet(`dashboard:tenant:${userId}`, 300, async () => {
    const [savedCount, bookingCount, pointsResult] = await Promise.all([
        prisma.savedRoom.count({ where: { user_id: userId } }),
        prisma.booking.count({ where: { tenant_id: userId } }),
        prisma.pointsTransaction.aggregate({
            where: { owner_id: userId },
            _sum: { points: true },
        }),
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

    const points = pointsResult._sum.points ?? 0;
    let tier = "Bronze";
    if (points >= 5000) {
        tier = "Gold";
    } else if (points >= 1500) {
        tier = "Silver";
    }

    return {
        active_booking: activeBookings.find(b => b.status === "approved" || b.status === "active") ?? null,
        recent_bookings: activeBookings,
        saved_count: savedCount,
        points: points,
        tier: tier,
    };
    }); // end getOrSet
};
