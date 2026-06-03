import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export const runExpirePromotionsJob = async () => {
    try {
        const now = new Date();

        // 1. Expire Room Boosts
        const expiredBoosts = await prisma.room.findMany({
            where: {
                is_boosted: true,
                boost_expires_at: { lt: now },
            },
            select: { id: true, title: true, owner_id: true },
        });

        for (const room of expiredBoosts) {
            await prisma.room.update({
                where: { id: room.id },
                data: {
                    is_boosted: false,
                    boost_expires_at: null,
                },
            });

            try {
                await prisma.notification.create({
                    data: {
                        user_id: room.owner_id,
                        notification_type: "points_expiring",
                        title: "Room Boost Expired 🚀",
                        body: `Your Premium Boost for room "${room.title}" has expired.`,
                        action_url: "/owner/wallet",
                    },
                });
            } catch (err) {
                logger.error(`[ExpirePromotionsJob] Failed to notify owner for expired boost on room ${room.id}:`, err);
            }

            logger.info(`[ExpirePromotionsJob] Expired boost for room ${room.id}.`);
        }

        // 2. Expire Room Featured Status
        const expiredFeatured = await prisma.room.findMany({
            where: {
                is_featured: true,
                featured_expires_at: { lt: now },
            },
            select: { id: true, title: true, owner_id: true },
        });

        for (const room of expiredFeatured) {
            await prisma.room.update({
                where: { id: room.id },
                data: {
                    is_featured: false,
                    featured_expires_at: null,
                },
            });

            try {
                await prisma.notification.create({
                    data: {
                        user_id: room.owner_id,
                        notification_type: "points_expiring",
                        title: "Featured Listing Expired ⭐",
                        body: `Your Featured Listing status for room "${room.title}" has expired.`,
                        action_url: "/owner/wallet",
                    },
                });
            } catch (err) {
                logger.error(`[ExpirePromotionsJob] Failed to notify owner for expired feature status on room ${room.id}:`, err);
            }

            logger.info(`[ExpirePromotionsJob] Expired featured status for room ${room.id}.`);
        }

        // 3. Expire Owner Certifications
        const expiredCertifications = await prisma.user.findMany({
            where: {
                verification_status: "verified",
                certification_expires_at: { lt: now },
            },
            select: { id: true, full_name: true },
        });

        for (const user of expiredCertifications) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verification_status: "pending",
                    certification_expires_at: null,
                },
            });

            try {
                await prisma.notification.create({
                    data: {
                        user_id: user.id,
                        notification_type: "points_expiring",
                        title: "Elite Profile Certification Expired 🪙",
                        body: `Your Elite Profile Certification has expired. Activate it again from your wallet to regain the 'Quality Verified' badge.`,
                        action_url: "/owner/wallet",
                    },
                });
            } catch (err) {
                logger.error(`[ExpirePromotionsJob] Failed to notify owner for expired certification on user ${user.id}:`, err);
            }

            logger.info(`[ExpirePromotionsJob] Expired certification for user ${user.id}.`);
        }

    } catch (err) {
        logger.error("[ExpirePromotionsJob] Unexpected error during promotion expiration run:", err);
    }
};

/** Start the scheduler — call once at server startup */
export const startExpirePromotionsScheduler = () => {
    logger.info("[ExpirePromotionsJob] Promotion and certification auto-expiry scheduler started (interval: 30 min).");
    // Run immediately on startup to catch any missed expirations
    runExpirePromotionsJob();
    // Then run on interval
    setInterval(runExpirePromotionsJob, INTERVAL_MS);
};
