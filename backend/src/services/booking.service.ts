import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.middleware.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BOOKING_SELECT = {
    tenant: { select: { id: true, full_name: true, profile_photo_url: true } },
    owner:  { select: { id: true, full_name: true, profile_photo_url: true } },
    room: {
        select: {
            id: true, title: true, rent_amount: true, price: true,
            city: true, locality: true, room_type: true, beds: true, baths: true,
            security_deposit_amount: true, furnished_status: true,
            images: { take: 1, select: { file_url: true } }
        }
    },
    reviews: {
        select: {
            id: true,
            rating: true,
            comment: true,
            created_at: true
        }
    }
};

/** P2-A: Create a platform notification for a target user */
const createNotification = async (
    userId: string,
    type: string,
    title: string,
    body: string,
    actionUrl?: string
) => {
    try {
        await prisma.notification.create({
            data: { user_id: userId, notification_type: type, title, body, action_url: actionUrl ?? null }
        });
    } catch (err) {
        // Non-critical — log and continue
        console.error("[Notification] Failed to create notification:", err);
    }
};

// ─── Services ────────────────────────────────────────────────────────────────

export const createBookingService = async (tenantId: string, roomId: string, data: any) => {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { owner: { select: { id: true, full_name: true } } }
    });
    if (!room) throw NotFoundError("Room");

    const existingBooking = await prisma.booking.findFirst({
        where: {
            room_id: roomId,
            tenant_id: tenantId,
            status: { in: ["pending", "approved", "confirmed"] }
        },
        include: BOOKING_SELECT
    });

    if (existingBooking) {
        return existingBooking;
    }

    const booking = await prisma.booking.create({
        data: {
            room_id: roomId,
            tenant_id: tenantId,
            owner_id: room.owner_id,
            request_type: data.request_type || "inquiry",
            message: data.message,
            status: "pending",
            // Phase 2: Populate expires_at so the auto-expiry scheduler can process it
            expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
        },
        include: BOOKING_SELECT
    });

    // Phase 2: Differentiate notification for visit_request vs inquiry
    const tenant = await prisma.user.findUnique({ where: { id: tenantId }, select: { full_name: true } });
    const isVisit = (data.request_type || "inquiry") === "visit_request";
    await createNotification(
        room.owner_id,
        isVisit ? "new_visit_request" : "new_booking_request",
        isVisit ? "New Visit Request" : "New Booking Request",
        isVisit
            ? `${tenant?.full_name ?? "A tenant"} has requested a visit to "${room.title}".`
            : `${tenant?.full_name ?? "A tenant"} has sent a booking inquiry for "${room.title}".`,
        `/owner/bookings`
    );

    return booking;
};

export const getOwnerBookingsService = async (ownerId: string) => {
    return prisma.booking.findMany({
        where: { owner_id: ownerId },
        include: BOOKING_SELECT,
        orderBy: { created_at: "desc" }
    });
};

export const getTenantBookingsService = async (tenantId: string) => {
    return prisma.booking.findMany({
        where: { tenant_id: tenantId },
        include: BOOKING_SELECT,
        orderBy: { created_at: "desc" }
    });
};

export const updateBookingStatusService = async (
    ownerId: string,
    bookingId: string,
    status: string,
    ownerNote?: string
) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            room: { select: { id: true, title: true } },
            tenant: { select: { id: true, full_name: true } }
        }
    });
    if (!booking || booking.owner_id !== ownerId) {
        throw NotFoundError("Booking");
    }

    // P2-C: Allowed status transitions for owner
    const allowedStatuses = ["approved", "rejected", "completed", "closed"];
    if (!allowedStatuses.includes(status)) {
        throw new Error(`Invalid status transition: "${status}". Allowed: ${allowedStatuses.join(", ")}`);
    }

    // Update room availability based on new status
    if (status === "approved") {
        await prisma.room.update({ where: { id: booking.room_id }, data: { status: "booked" } });
    } else if (status === "rejected" || status === "closed") {
        await prisma.room.update({ where: { id: booking.room_id }, data: { status: "active" } });
    } else if (status === "completed") {
        // Room becomes available again after tenancy completion
        await prisma.room.update({ where: { id: booking.room_id }, data: { status: "active" } });
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status,
            ...(ownerNote !== undefined && { owner_note: ownerNote }),
        },
        include: BOOKING_SELECT
    });

    // P2-A: Notify the tenant about the status change
    const notifMap: Record<string, { title: string; body: string }> = {
        approved:  { title: "Booking Approved! 🎉", body: `Your booking request for "${booking.room.title}" has been approved.` },
        rejected:  { title: "Booking Rejected", body: `Your booking request for "${booking.room.title}" was not approved by the owner.` },
        completed: { title: "Booking Completed", body: `Your stay at "${booking.room.title}" has been marked as completed.` },
        closed:    { title: "Booking Closed", body: `Your booking request for "${booking.room.title}" has been closed.` },
    };
    const notif = notifMap[status];
    if (notif) {
        await createNotification(booking.tenant_id, `booking_${status}`, notif.title, notif.body, `/tenant/bookings`);
    }

    return updated;
};

export const cancelBookingService = async (tenantId: string, bookingId: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { room: { select: { title: true } } }
    });
    if (!booking || booking.tenant_id !== tenantId) {
        throw NotFoundError("Booking");
    }

    await prisma.room.update({ where: { id: booking.room_id }, data: { status: "active" } });

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" },
        include: BOOKING_SELECT
    });

    // P2-A: Notify the owner that the tenant cancelled
    await createNotification(
        booking.owner_id,
        "booking_cancelled",
        "Booking Cancelled",
        `A tenant cancelled their booking request for "${booking.room?.title ?? "your room"}".`,
        `/owner/bookings`
    );

    return updated;
};
