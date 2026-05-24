import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.middleware.js";

export const createBookingService = async (tenantId: string, roomId: string, data: any) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw NotFoundError("Room");

    const existingBooking = await prisma.booking.findFirst({
        where: {
            room_id: roomId,
            tenant_id: tenantId,
            status: { in: ["pending", "approved", "confirmed"] }
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            room: { select: { id: true, title: true, rent_amount: true, city: true, locality: true, images: { take: 1, select: { file_url: true } } } }
        }
    });

    if (existingBooking) {
        return existingBooking;
    }

    return prisma.booking.create({
        data: {
            room_id: roomId,
            tenant_id: tenantId,
            owner_id: room.owner_id,
            request_type: data.request_type || "inquiry",
            message: data.message,
            status: "pending",
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            room: { select: { id: true, title: true, rent_amount: true, city: true, locality: true, images: { take: 1, select: { file_url: true } } } }
        }
    });
};

export const getOwnerBookingsService = async (ownerId: string) => {
    return prisma.booking.findMany({
        where: { owner_id: ownerId },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            room: { select: { id: true, title: true, rent_amount: true, price: true, address: true, city: true, locality: true, room_type: true, beds: true, baths: true, security_deposit_amount: true, furnished_status: true, images: { take: 1, select: { file_url: true } } } }
        },
        orderBy: { created_at: "desc" }
    });
};

export const getTenantBookingsService = async (tenantId: string) => {
    return prisma.booking.findMany({
        where: { tenant_id: tenantId },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            owner: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            room: { select: { id: true, title: true, rent_amount: true, price: true, address: true, city: true, locality: true, room_type: true, beds: true, baths: true, security_deposit_amount: true, furnished_status: true, images: { take: 1, select: { file_url: true } } } }
        },
        orderBy: { created_at: "desc" }
    });
};

export const updateBookingStatusService = async (ownerId: string, bookingId: string, status: string, ownerNote?: string) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.owner_id !== ownerId) {
        throw NotFoundError("Booking");
    }

    if (status === "approved") {
        await prisma.room.update({
            where: { id: booking.room_id },
            data: { status: "booked" }
        });
    } else if (status === "rejected" || status === "cancelled") {
        await prisma.room.update({
            where: { id: booking.room_id },
            data: { status: "active" }
        });
    }

    return prisma.booking.update({
        where: { id: bookingId },
        data: {
            status,
            ...(ownerNote !== undefined && { owner_note: ownerNote }),
        },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            room: { select: { id: true, title: true, rent_amount: true, city: true, locality: true, images: { take: 1, select: { file_url: true } } } }
        }
    });
};

export const cancelBookingService = async (tenantId: string, bookingId: string) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.tenant_id !== tenantId) {
        throw NotFoundError("Booking");
    }

    await prisma.room.update({
        where: { id: booking.room_id },
        data: { status: "active" }
    });

    return prisma.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" },
        include: {
            tenant: { select: { id: true, full_name: true, profile_photo_url: true, mobile_number: true } },
            room: { select: { id: true, title: true, rent_amount: true, city: true, locality: true, images: { take: 1, select: { file_url: true } } } }
        }
    });
};
