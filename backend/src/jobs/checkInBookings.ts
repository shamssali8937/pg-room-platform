import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";
import { invalidateRoomCache } from "../services/room.service.js";

const INTERVAL_MS = 3 * 1000; // 3 seconds

export const runCheckInBookingsJob = async () => {
    try {
        // Find all confirmed (approved) bookings with a past or present requested_date
        const bookingsToCheckIn = await prisma.booking.findMany({
            where: {
                status: "approved",
                requested_date: { lte: new Date() }
            },
            include: {
                room: { select: { id: true, title: true, owner_id: true } }
            }
        });

        if (bookingsToCheckIn.length === 0) return;

        logger.info(`[CheckInJob] Found ${bookingsToCheckIn.length} booking(s) to check in.`);

        for (const booking of bookingsToCheckIn) {
            // 1. Update booking status to "checked_in"
            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: "checked_in" }
            });

            // 2. Set room to "occupied"
            await prisma.room.update({
                where: { id: booking.room_id },
                data: { status: "occupied" }
            });

            // 3. Clear/Invalidate Cache
            if (booking.room?.owner_id) {
                await invalidateRoomCache(booking.room_id, booking.room.owner_id);
            }

            // 4. Notify tenant and owner
            try {
                await prisma.notification.create({
                    data: {
                        user_id: booking.tenant_id,
                        notification_type: "booking_checked_in",
                        title: "Stay Checked In! 🔑",
                        body: `Your stay at "${booking.room?.title ?? "a room"}" has officially started! You are now checked in.`,
                        action_url: "/tenant/bookings"
                    }
                });

                await prisma.notification.create({
                    data: {
                        user_id: booking.owner_id,
                        notification_type: "booking_checked_in_owner",
                        title: "Tenant Checked In 🔑",
                        body: `Your tenant has checked in to "${booking.room?.title ?? "your room"}".`,
                        action_url: "/owner/bookings"
                    }
                });
            } catch (notifErr) {
                logger.error("[CheckInJob] Failed to create check-in notifications:", notifErr);
            }

            logger.info(`[CheckInJob] Automatically checked in booking ${booking.id} for room ${booking.room_id}.`);
        }
    } catch (err) {
        logger.error("[CheckInJob] Unexpected error during booking check-in run:", err);
    }
};

/** Start the scheduler — call once at server startup */
export const startCheckInBookingsScheduler = () => {
    logger.info("[CheckInJob] Booking auto-check-in scheduler started (interval: 30 min).");
    // Run immediately on startup to check for any due check-ins
    runCheckInBookingsJob();
    // Then run on interval
    setInterval(runCheckInBookingsJob, INTERVAL_MS);
};
