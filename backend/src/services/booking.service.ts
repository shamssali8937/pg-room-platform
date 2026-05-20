import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.middleware.js";

export const createBookingService = async (tenantId: string, roomId: string, data: any) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw NotFoundError("Room");

    return prisma.booking.create({
        data: {
            room_id: roomId,
            tenant_id: tenantId,
            owner_id: room.owner_id,
            request_type: data.request_type || "inquiry",
            message: data.message,
            status: "pending",
        }
    });
};

export const getOwnerBookingsService = async (ownerId: string) => {
    return prisma.booking.findMany({
        where: { owner_id: ownerId },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true } },
            room: { select: { id: true, title: true, rent_amount: true, images: { take: 1, select: { file_url: true } } } }
        },
        orderBy: { created_at: "desc" }
    });
};

export const getTenantBookingsService = async (tenantId: string) => {
    return prisma.booking.findMany({
        where: { tenant_id: tenantId },
        include: {
            owner: { select: { id: true, full_name: true, profile_photo_url: true } },
            room: { select: { id: true, title: true, rent_amount: true, city: true, locality: true, images: { take: 1, select: { file_url: true } } } }
        },
        orderBy: { created_at: "desc" }
    });
};

export const updateBookingStatusService = async (ownerId: string, bookingId: string, status: string, ownerNote?: string) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.owner_id !== ownerId) {
        throw NotFoundError("Booking");
    }

    return prisma.booking.update({
        where: { id: bookingId },
        data: {
            status,
            ...(ownerNote !== undefined && { owner_note: ownerNote }),
        }
    });
};

export const cancelBookingService = async (tenantId: string, bookingId: string) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.tenant_id !== tenantId) {
        throw NotFoundError("Booking");
    }

    return prisma.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" }
    });
};
