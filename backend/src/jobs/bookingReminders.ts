/**
 * Phase 2: Booking Reminder Notifications Job
 *
 * Runs on a 30-minute interval.
 * - Owners: notified if booking is pending > 24 hours unanswered.
 * - Tenants: notified if booking is pending > 48 hours unanswered.
 *
 * Uses Notification lookup (by specific action_url/notification_type) to prevent double-reminding.
 */

import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export const runBookingRemindersJob = async () => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        // 1. Owner Reminders (pending > 24h unanswered)
        const pendingForOwners = await prisma.booking.findMany({
            where: {
                status: "pending",
                created_at: { lt: oneDayAgo },
            },
            include: {
                room: { select: { title: true } },
                tenant: { select: { full_name: true } },
            },
        });

        for (const booking of pendingForOwners) {
            const actionUrl = `/owner/bookings?id=${booking.id}`;
            // Check if reminder already sent
            const existingNotif = await prisma.notification.findFirst({
                where: {
                    user_id: booking.owner_id,
                    notification_type: "booking_reminder_24h",
                    action_url: actionUrl,
                },
            });

            if (!existingNotif) {
                try {
                    await prisma.notification.create({
                        data: {
                            user_id: booking.owner_id,
                            notification_type: "booking_reminder_24h",
                            title: "Action Required: Pending Booking Request ⏳",
                            body: `The booking request from ${booking.tenant.full_name} for "${booking.room.title}" has been pending for over 24 hours. Please accept or reject it.`,
                            action_url: actionUrl,
                        },
                    });
                    logger.info(`[ReminderJob] Sent 24h reminder to owner ${booking.owner_id} for booking ${booking.id}`);
                } catch (err) {
                    logger.error(`[ReminderJob] Failed to create 24h owner notification for booking ${booking.id}:`, err);
                }
            }
        }

        // 2. Tenant Reminders (pending > 48h unanswered)
        const pendingForTenants = await prisma.booking.findMany({
            where: {
                status: "pending",
                created_at: { lt: twoDaysAgo },
            },
            include: {
                room: { select: { title: true } },
            },
        });

        for (const booking of pendingForTenants) {
            const actionUrl = `/tenant/bookings?id=${booking.id}`;
            // Check if reminder already sent
            const existingNotif = await prisma.notification.findFirst({
                where: {
                    user_id: booking.tenant_id,
                    notification_type: "booking_reminder_48h",
                    action_url: actionUrl,
                },
            });

            if (!existingNotif) {
                try {
                    await prisma.notification.create({
                        data: {
                            user_id: booking.tenant_id,
                            notification_type: "booking_reminder_48h",
                            title: "Booking Request Update ⏳",
                            body: `Your booking request for "${booking.room.title}" has been pending for over 48 hours. We have prompted the owner. You can also explore other options in the meantime.`,
                            action_url: actionUrl,
                        },
                    });
                    logger.info(`[ReminderJob] Sent 48h reminder to tenant ${booking.tenant_id} for booking ${booking.id}`);
                } catch (err) {
                    logger.error(`[ReminderJob] Failed to create 48h tenant notification for booking ${booking.id}:`, err);
                }
            }
        }
    } catch (err) {
        logger.error("[ReminderJob] Unexpected error during booking reminders run:", err);
    }
};

/** Start the scheduler — call once at server startup */
export const startBookingRemindersScheduler = () => {
    logger.info("[ReminderJob] Booking reminder scheduler started (interval: 30 min).");
    // Run immediately on startup
    runBookingRemindersJob();
    // Then run on interval
    setInterval(runBookingRemindersJob, INTERVAL_MS);
};
