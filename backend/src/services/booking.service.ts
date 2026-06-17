import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../middleware/errorHandler.middleware.js";
import { sendEmail } from "../utils/mail.js";
import { bookingCreatedEmail, bookingStatusChangedEmail, bookingCancelledEmail, pointsEarnedEmail } from "../utils/emailTemplates.js";

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
            status: { in: ["pending", "approved", "confirmed", "checked_in"] }
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
            requested_date: data.requested_date ? new Date(data.requested_date) : (room.availability_date ? new Date(room.availability_date) : new Date()),
            rent_amount: data.rent_amount ? Number(data.rent_amount) : null,
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

    // Gap 1: Send email notification to owner
    try {
        const ownerUser = await prisma.user.findUnique({ where: { id: room.owner_id }, select: { email: true, full_name: true } });
        if (ownerUser?.email) {
            await sendEmail(
                ownerUser.email,
                isVisit ? "New Visit Request – PG Room" : "New Booking Inquiry – PG Room",
                bookingCreatedEmail(ownerUser.full_name ?? "Owner", tenant?.full_name ?? "A tenant", room.title, data.request_type || "inquiry")
            );
        }
    } catch (err) {
        console.error("[Email] Failed to send booking created email:", err);
    }

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
    const allowedStatuses = ["approved", "rejected", "completed", "closed", "checked_in"];
    if (!allowedStatuses.includes(status)) {
        throw new Error(`Invalid status transition: "${status}". Allowed: ${allowedStatuses.join(", ")}`);
    }

    // Update room availability based on new status
    if (status === "approved") {
        await prisma.room.update({ where: { id: booking.room_id }, data: { status: "booked" } });
    } else if (status === "checked_in") {
        await prisma.room.update({ where: { id: booking.room_id }, data: { status: "occupied" } });
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
        approved:   { title: "Booking Approved! 🎉", body: `Your booking request for "${booking.room.title}" has been approved.` },
        checked_in: { title: "Checked In! 🔑", body: `You have successfully checked in to "${booking.room.title}".` },
        rejected:   { title: "Booking Rejected", body: `Your booking request for "${booking.room.title}" was not approved by the owner.` },
        completed:  { title: "Booking Completed", body: `Your stay at "${booking.room.title}" has been marked as completed.` },
        closed:     { title: "Booking Closed", body: `Your booking request for "${booking.room.title}" has been closed.` },
    };
    const notif = notifMap[status];
    if (notif) {
        await createNotification(booking.tenant_id, `booking_${status}`, notif.title, notif.body, `/tenant/bookings`);
    }

    // Gap 1: Send email notification to tenant on status change
    try {
        const tenantUser = await prisma.user.findUnique({ where: { id: booking.tenant_id }, select: { email: true, full_name: true } });
        if (tenantUser?.email) {
            await sendEmail(
                tenantUser.email,
                `Booking ${status.charAt(0).toUpperCase() + status.slice(1)} – PG Room`,
                bookingStatusChangedEmail(tenantUser.full_name ?? "Tenant", booking.room.title, status, ownerNote)
            );
        }
    } catch (err) {
        console.error("[Email] Failed to send booking status email:", err);
    }

    // Gap 4: Award tenant points when booking is completed
    if (status === "completed") {
        try {
            const existingPtsTx = await prisma.pointsTransaction.findFirst({
                where: { owner_id: booking.tenant_id, reference_id: bookingId, reason_code: "booking_completed" }
            });
            if (!existingPtsTx) {
                const currentPts = await prisma.pointsTransaction.aggregate({ where: { owner_id: booking.tenant_id }, _sum: { points: true } });
                const balanceAfter = (currentPts._sum.points ?? 0) + 25;
                await prisma.pointsTransaction.create({
                    data: {
                        owner_id: booking.tenant_id,
                        room_id: booking.room_id,
                        transaction_type: "EARNED",
                        points: 25,
                        reason_code: "booking_completed",
                        reference_id: bookingId,
                        balance_after: balanceAfter,
                        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                    }
                });
                await createNotification(booking.tenant_id, "points_credited", "Points Earned! 🪙", `You earned 25 points for completing your stay at "${booking.room.title}".`, `/tenant/bookings`);

                // Send points email
                const tenantForPts = await prisma.user.findUnique({ where: { id: booking.tenant_id }, select: { email: true, full_name: true } });
                if (tenantForPts?.email) {
                    await sendEmail(tenantForPts.email, "Points Earned – PG Room", pointsEarnedEmail(tenantForPts.full_name ?? "User", 25, "Booking completed"));
                }
            }
        } catch (err) {
            console.error("[TenantPoints] Failed to award booking_completed points:", err);
        }
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

    // Gap 1: Send email notification to owner on cancellation
    try {
        const ownerUser = await prisma.user.findUnique({ where: { id: booking.owner_id }, select: { email: true, full_name: true } });
        const tenantUser = await prisma.user.findUnique({ where: { id: booking.tenant_id }, select: { full_name: true } });
        if (ownerUser?.email) {
            await sendEmail(
                ownerUser.email,
                "Booking Cancelled – PG Room",
                bookingCancelledEmail(ownerUser.full_name ?? "Owner", tenantUser?.full_name ?? "A tenant", booking.room?.title ?? "your room")
            );
        }
    } catch (err) {
        console.error("[Email] Failed to send booking cancelled email:", err);
    }

    return updated;
};

export const checkoutBookingService = async (tenantId: string, bookingId: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            room: { select: { id: true, title: true } },
            tenant: { select: { id: true, full_name: true } }
        }
    });
    if (!booking || booking.tenant_id !== tenantId) {
        throw NotFoundError("Booking");
    }

    if (booking.status !== "checked_in") {
        throw new Error("You can only check out from an active, checked-in stay.");
    }

    // Update room status back to active (removes occupied watermark)
    await prisma.room.update({ where: { id: booking.room_id }, data: { status: "active" } });

    // Transition booking to completed
    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: "completed",
            owner_note: "Tenant checked out manually"
        },
        include: BOOKING_SELECT
    });

    // Send notifications
    await createNotification(
        booking.owner_id,
        "tenant_checked_out",
        "Tenant Checked Out",
        `The tenant has checked out of your room "${booking.room.title}".`,
        `/owner/bookings`
    );

    await createNotification(
        booking.tenant_id,
        "booking_completed",
        "Stay Completed 🎉",
        `You have successfully checked out of "${booking.room.title}". Hope you had a great stay!`,
        `/tenant/bookings`
    );

    // Award tenant points when booking is completed
    try {
        const existingPtsTx = await prisma.pointsTransaction.findFirst({
            where: { owner_id: booking.tenant_id, reference_id: bookingId, reason_code: "booking_completed" }
        });
        if (!existingPtsTx) {
            const currentPts = await prisma.pointsTransaction.aggregate({ where: { owner_id: booking.tenant_id }, _sum: { points: true } });
            const balanceAfter = (currentPts._sum.points ?? 0) + 25;
            await prisma.pointsTransaction.create({
                data: {
                    owner_id: booking.tenant_id,
                    room_id: booking.room_id,
                    transaction_type: "EARNED",
                    points: 25,
                    reason_code: "booking_completed",
                    reference_id: bookingId,
                    balance_after: balanceAfter,
                    expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                }
            });
            await createNotification(booking.tenant_id, "points_credited", "Points Earned! 🪙", `You earned 25 points for completing your stay at "${booking.room.title}".`, `/tenant/bookings`);

            // Send points email
            const tenantForPts = await prisma.user.findUnique({ where: { id: booking.tenant_id }, select: { email: true, full_name: true } });
            if (tenantForPts?.email) {
                await sendEmail(tenantForPts.email, "Points Earned – PG Room", pointsEarnedEmail(tenantForPts.full_name ?? "User", 25, "Booking completed"));
            }
        }
    } catch (err) {
        console.error("[TenantPoints] Failed to award booking_completed points:", err);
    }

    return updated;
};
