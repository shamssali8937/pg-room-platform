import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.middleware.js";

export const getPendingListingsService = async () => {
    return prisma.room.findMany({
        where: { status: "pending" },
        include: {
            owner: { select: { full_name: true, email: true, profile_photo_url: true } },
            images: true,
        },
        orderBy: { created_at: "asc" }
    });
};

export const getAllListingsService = async (status?: string) => {
    const where = status ? { status } : {};
    return prisma.room.findMany({
        where,
        include: { owner: { select: { full_name: true, email: true } } },
        orderBy: { created_at: "desc" }
    });
};

export const moderateListingService = async (adminId: string, roomId: string, status: string, reason?: string) => {
    const room = await prisma.room.update({
        where: { id: roomId },
        data: {
            status,
            ...(reason !== undefined && { rejected_reason: reason }),
        }
    });

    await prisma.adminAction.create({
        data: {
            admin_id: adminId,
            action_type: status === "approved" ? "APPROVE_LISTING" : "REJECT_LISTING",
            target_type: "room",
            target_id: roomId,
            notes: reason || "",
        }
    });

    return room;
};

export const getUsersService = async () => {
    return prisma.user.findMany({
        select: {
            id: true, full_name: true, email: true, role: true, created_at: true,
            account_status: true, mobile_number: true, _count: { select: { rooms: true, bookings_as_tenant: true } }
        },
        orderBy: { created_at: "desc" }
    });
};

export const updateUserStatusService = async (adminId: string, userId: string, status: string, reason: string) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { account_status: status }
    });

    await prisma.adminAction.create({
        data: {
            admin_id: adminId,
            action_type: "UPDATE_USER_STATUS",
            target_type: "user",
            target_id: userId,
            notes: `Status changed to ${status}. Reason: ${reason}`,
        }
    });

    return user;
};

export const getReportsService = async () => {
    return prisma.report.findMany({
        include: { reporter: { select: { full_name: true, email: true } } },
        orderBy: { created_at: "desc" }
    });
};

export const resolveReportService = async (adminId: string, reportId: string, resolutionDetails: string) => {
    const report = await prisma.report.update({
        where: { id: reportId },
        data: {
            status: "resolved",
            admin_action: resolutionDetails,
            resolved_at: new Date()
        }
    });

    await prisma.adminAction.create({
        data: {
            admin_id: adminId,
            action_type: "RESOLVE_REPORT",
            target_type: "report",
            target_id: reportId,
            notes: resolutionDetails
        }
    });

    return report;
};

export const getAdminPointsTransactionsService = async () => {
    return prisma.pointsTransaction.findMany({
        include: { owner: { select: { full_name: true, email: true } } },
        orderBy: { created_at: "desc" }
    });
};

export const adjustPointsService = async (adminId: string, ownerId: string, points: number, reasonCode: string) => {
    // Current balance
    const currentPoints = await prisma.pointsTransaction.aggregate({
        where: { owner_id: ownerId },
        _sum: { points: true }
    });
    const balanceAfter = (currentPoints._sum.points || 0) + points;

    const transaction = await prisma.pointsTransaction.create({
        data: {
            owner_id: ownerId,
            transaction_type: points >= 0 ? "admin_credit" : "admin_debit",
            points,
            reason_code: reasonCode,
            balance_after: balanceAfter
        }
    });

    await prisma.adminAction.create({
        data: {
            admin_id: adminId,
            action_type: "ADJUST_POINTS",
            target_type: "user",
            target_id: ownerId,
            notes: `Adjusted points by ${points}. Reason: ${reasonCode}`
        }
    });

    return transaction;
};

export const getAuditActionsService = async () => {
    return prisma.adminAction.findMany({
        include: { admin: { select: { full_name: true, email: true } } },
        orderBy: { created_at: "desc" }
    });
};
