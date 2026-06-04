/**
 * P2-D: Auto-Expiry Job
 *
 * Runs on a 30-minute interval.
 * Finds all pending bookings whose `expires_at` is in the past
 * and transitions them to "expired", restoring the room to "active".
 *
 * Also creates a notification for the tenant so they know to look elsewhere.
 */

import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export const runExpireBookingsJob = async () => {
    try {
        // Find all pending bookings with a past expires_at
        const staleBookings = await prisma.booking.findMany({
            where: {
                status: "pending",
                expires_at: { lt: new Date() }
            },
            include: {
                room: { select: { id: true, title: true } }
            }
        });

        if (staleBookings.length === 0) return;

        logger.info(`[ExpireJob] Found ${staleBookings.length} booking(s) to expire.`);

        for (const booking of staleBookings) {
            // 1. Update booking status to "expired"
            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: "expired" }
            });

            // 2. Restore room to "active"
            await prisma.room.update({
                where: { id: booking.room_id },
                data: { status: "active" }
            });

            // 3. Notify the tenant
            try {
                await prisma.notification.create({
                    data: {
                        user_id: booking.tenant_id,
                        notification_type: "booking_expired",
                        title: "Booking Request Expired",
                        body: `Your booking request for "${booking.room?.title ?? "a room"}" has expired as the owner did not respond in time. Browse similar rooms below.`,
                        action_url: "/tenant/browse"
                    }
                });
            } catch (notifErr) {
                logger.error("[ExpireJob] Failed to create expiry notification:", notifErr);
            }

            logger.info(`[ExpireJob] Expired booking ${booking.id} for room ${booking.room_id}.`);
        }
    } catch (err) {
        logger.error("[ExpireJob] Unexpected error during booking expiry run:", err);
    }
};

/** Start the scheduler — call once at server startup */
export const startExpireBookingsScheduler = () => {
    logger.info("[ExpireJob] Booking auto-expiry scheduler started (interval: 30 min).");
    // Run immediately on startup to catch any missed expirations
    runExpireBookingsJob();
    // Then run on interval
    setInterval(runExpireBookingsJob, INTERVAL_MS);
};
