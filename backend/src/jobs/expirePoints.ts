/**
 * Phase 9: Points Expiration Job
 *
 * Runs on a 12-hour interval.
 * Finds all owners with no points transactions in the last 180 days,
 * and expires their entire active points balance if it is greater than 0.
 */

import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

const INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours
const INACTIVITY_LIMIT_MS = 180 * 24 * 60 * 60 * 1000; // 180 days

export const runExpirePointsJob = async () => {
    try {
        logger.info("[ExpirePointsJob] Starting points expiration check...");
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - INACTIVITY_LIMIT_MS);

        // Find all owners
        const owners = await prisma.user.findMany({
            where: { role: "owner" }
        });

        for (const owner of owners) {
            // Find latest points transaction for this owner
            const latestTx = await prisma.pointsTransaction.findFirst({
                where: { owner_id: owner.id },
                orderBy: { created_at: "desc" }
            });

            // If they have transactions and the latest is older than 180 days
            if (latestTx && latestTx.created_at < cutoffDate) {
                // Get current points balance
                const balanceResult = await prisma.pointsTransaction.aggregate({
                    where: { owner_id: owner.id },
                    _sum: { points: true }
                });

                const currentBalance = balanceResult._sum.points ?? 0;

                if (currentBalance > 0) {
                    await prisma.$transaction(async (tx) => {
                        await tx.pointsTransaction.create({
                            data: {
                                owner_id: owner.id,
                                transaction_type: "EXPIRED",
                                points: -currentBalance,
                                reason_code: "inactivity_expiry",
                                balance_after: 0
                            }
                        });

                        await tx.notification.create({
                            data: {
                                user_id: owner.id,
                                notification_type: "points_expired",
                                title: "Points Expired ⚠️",
                                body: "Your points balance has expired due to 180 days of wallet inactivity.",
                                action_url: "/owner/wallet"
                            }
                        });
                    });

                    logger.info(`[ExpirePointsJob] Expired ${currentBalance} points for owner ${owner.id} due to 180-day inactivity.`);
                }
            }
        }
        logger.info("[ExpirePointsJob] Points expiration check completed.");
    } catch (err) {
        logger.error("[ExpirePointsJob] Unexpected error during points expiration run:", err);
    }
};

/** Start the scheduler — call once at server startup */
export const startExpirePointsScheduler = () => {
    logger.info("[ExpirePointsJob] Points expiration scheduler started (interval: 12 hours).");
    // Run immediately on startup
    runExpirePointsJob();
    // Then run on interval
    setInterval(runExpirePointsJob, INTERVAL_MS);
};
