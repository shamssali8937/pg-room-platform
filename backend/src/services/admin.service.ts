import { prisma } from "../config/prisma.js";

// Phase 3: Notification helper — mirrors pattern from booking.service.ts
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
        console.error("[Notification] Failed to create notification:", err);
    }
};

// ─── Helper: normalize images for frontend ────────────────────────────────────
const normalizeImages = (images: any[]) =>
    (images ?? []).map((img) => ({ url: img.file_url, public_id: img.file_hash ?? "" }));


export const getPendingListingsService = async () => {
    const rooms = await prisma.room.findMany({
        where: { status: "pending" },
        include: {
            owner: { select: { id: true, full_name: true, email: true, profile_photo_url: true } },
            images: true,
            reviews: {
                include: {
                    reviewer: { select: { full_name: true, profile_photo_url: true } }
                }
            }
        },
        orderBy: { created_at: "asc" }
    });
    return Promise.all(rooms.map(async (r) => {
        const lastSuspension = await prisma.adminAction.findFirst({
            where: {
                target_type: "room",
                target_id: r.id,
                action_type: "SUSPEND_LISTING"
            },
            orderBy: { created_at: "desc" }
        });
        return {
            ...r,
            images: normalizeImages(r.images),
            was_suspended: !!lastSuspension,
            last_suspension_reason: lastSuspension?.notes ?? null
        };
    }));
};

export const getAllListingsService = async (status?: string) => {
    const where = status ? { status } : {};
    const rooms = await prisma.room.findMany({
        where,
        include: {
            owner: { select: { id: true, full_name: true, email: true, profile_photo_url: true } },
            images: true,
            reviews: {
                include: {
                    reviewer: { select: { full_name: true, profile_photo_url: true } }
                }
            }
        },
        orderBy: { created_at: "desc" }
    });
    return Promise.all(rooms.map(async (r) => {
        const lastSuspension = await prisma.adminAction.findFirst({
            where: {
                target_type: "room",
                target_id: r.id,
                action_type: "SUSPEND_LISTING"
            },
            orderBy: { created_at: "desc" }
        });
        return {
            ...r,
            images: normalizeImages(r.images),
            was_suspended: !!lastSuspension,
            last_suspension_reason: lastSuspension?.notes ?? null
        };
    }));
};

export const moderateListingService = async (adminId: string, roomId: string, status: string, reason?: string) => {
    const room = await prisma.room.update({
        where: { id: roomId },
        data: {
            status,
            ...(reason !== undefined && { rejected_reason: reason }),
            // Phase 3: reset promotion flags when listing is suspended/rejected
            ...(status !== "active" && { is_boosted: false, is_featured: false }),
        },
        include: {
            owner: { select: { id: true, full_name: true } },
            images: true
        }
    });

    await prisma.adminAction.create({
        data: {
            admin_id: adminId,
            action_type: status === "active" ? "APPROVE_LISTING" : status === "rejected" ? "REJECT_LISTING" : "SUSPEND_LISTING",
            target_type: "room",
            target_id: roomId,
            notes: reason || "",
        }
    });

    // Phase 9: Points economy logic on approval
    if (status === "active" && room.owner) {
        const ownerId = room.owner.id;

        // Check if the owner already has an approval points transaction for this room
        const existingApprovalTx = await prisma.pointsTransaction.findFirst({
            where: {
                owner_id: ownerId,
                room_id: roomId,
                reason_code: "listing_approved"
            }
        });

        const isRelist = !!existingApprovalTx;
        const pointsAwarded = isRelist ? 10 : 20;
        const reasonCode = isRelist ? "listing_relist" : "listing_approved";

        // Get current points balance
        const pointsResult = await prisma.pointsTransaction.aggregate({
            where: { owner_id: ownerId },
            _sum: { points: true },
        });
        const currentPoints = pointsResult._sum.points ?? 0;

        let balanceAfter = currentPoints + pointsAwarded;
        const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 180 days from now

        // Create transaction for base points
        await prisma.pointsTransaction.create({
            data: {
                owner_id: ownerId,
                room_id: roomId,
                transaction_type: "EARNED",
                points: pointsAwarded,
                reason_code: reasonCode,
                balance_after: balanceAfter,
                expires_at: expiresAt
            }
        });

        // Notify of credited points
        await createNotification(
            ownerId,
            "points_credited",
            "Points Credited! 🪙",
            `You earned ${pointsAwarded} points for ${isRelist ? "relisting" : "listing approval of"} "${room.title}".`,
            `/owner/wallet`
        );

        // Quality bonus: only check if this is the first approval (not a relist)
        if (!isRelist) {
            const hasDescription = room.description && room.description.length >= 100;
            const hasLandmark = room.landmark && room.landmark.trim().length > 0;
            const hasAmenities = room.amenities_list && room.amenities_list.length >= 3;
            const hasImages = room.images && room.images.length >= 3;
            const hasFurnished = room.furnished_status && room.furnished_status.trim().length > 0;

            if (hasDescription && hasLandmark && hasAmenities && hasImages && hasFurnished) {
                balanceAfter += 5;
                await prisma.pointsTransaction.create({
                    data: {
                        owner_id: ownerId,
                        room_id: roomId,
                        transaction_type: "EARNED",
                        points: 5,
                        reason_code: "quality_bonus",
                        balance_after: balanceAfter,
                        expires_at: expiresAt
                    }
                });

                // Notify of quality bonus
                await createNotification(
                    ownerId,
                    "points_credited",
                    "Quality Bonus Points! 🪙",
                    `You earned 5 bonus points for submitting a high-quality listing with complete details for "${room.title}".`,
                    `/owner/wallet`
                );
            }
        }
    }

    // Phase 3: Notify the listing owner of admin's moderation decision
    const notifMap: Record<string, { type: string; title: string; body: string }> = {
        active:    { type: "listing_approved", title: "Listing Approved! ✅", body: `Your listing "${room.title}" has been approved and is now live.` },
        rejected:  { type: "listing_rejected", title: "Listing Rejected", body: `Your listing "${room.title}" was rejected. Reason: ${reason ?? "Not specified"}. Please update and resubmit.` },
        suspended: { type: "listing_suspended", title: "Listing Suspended", body: `Your listing "${room.title}" has been suspended by admin. Please contact support for more information.` },
    };
    const notif = notifMap[status];
    if (notif && room.owner) {
        await createNotification(room.owner.id, notif.type, notif.title, notif.body, `/owner/listings`);
    }

    return room;
};

export const getUsersService = async () => {
    return prisma.user.findMany({
        select: {
            id: true, full_name: true, email: true, role: true, created_at: true,
            account_status: true, mobile_number: true, verification_status: true,
            profile_photo_url: true,
            documents: {
                select: {
                    id: true,
                    doc_type: true,
                    file_url: true,
                    status: true,
                    created_at: true
                }
            },
            _count: { select: { rooms: true, bookings_as_tenant: true } }
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

    // Phase 3: Notify the user about their account status change
    const accountNotifMap: Record<string, { type: string; title: string; body: string }> = {
        warned:    { type: "account_warned",    title: "Account Warning",    body: `Your account has received a warning. Reason: ${reason ?? "Policy violation"}.` },
        suspended: { type: "account_suspended", title: "Account Suspended",  body: `Your account has been suspended. Reason: ${reason ?? "Policy violation"}. Please contact support.` },
        banned:    { type: "account_banned",    title: "Account Banned",     body: `Your account has been permanently banned. Reason: ${reason ?? "Policy violation"}.` },
        active:    { type: "account_restored",  title: "Account Restored",   body: `Your account has been restored and is active again.` },
    };
    const accountNotif = accountNotifMap[status];
    if (accountNotif) {
        await createNotification(userId, accountNotif.type, accountNotif.title, accountNotif.body, `/`);
    }

    return user;
};

export const getReportsService = async () => {
    return prisma.report.findMany({
        include: { reporter: { select: { full_name: true, email: true, profile_photo_url: true } } },
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

    // Phase 3: Notify the reporter that their report has been resolved
    await createNotification(
        report.reporter_id,
        "report_resolved",
        "Report Resolved",
        `Your report (#${report.id.slice(0, 8)}) has been reviewed and resolved by our admin team.`,
        `/`
    );

    return report;
};

export const getAdminPointsTransactionsService = async () => {
    return prisma.pointsTransaction.findMany({
        include: { owner: { select: { full_name: true, email: true, profile_photo_url: true } } },
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
        },
        include: { owner: { select: { full_name: true, email: true } } }
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

export const getInquiriesService = async () => {
    return prisma.booking.findMany({
        include: {
            tenant: { select: { id: true, full_name: true, email: true, mobile_number: true, profile_photo_url: true } },
            owner: { select: { id: true, full_name: true, email: true, mobile_number: true, profile_photo_url: true } },
            room: { select: { id: true, title: true, price: true, rent_amount: true, city: true, locality: true } }
        },
        orderBy: { created_at: "desc" }
    });
};

export const moderateInquiryService = async (adminId: string, bookingId: string, status: string, notes?: string) => {
    const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status,
            ...(notes !== undefined && { owner_note: notes })
        },
        include: {
            tenant: { select: { id: true, full_name: true, email: true, mobile_number: true, profile_photo_url: true } },
            owner: { select: { id: true, full_name: true, email: true, mobile_number: true, profile_photo_url: true } },
            room: { select: { id: true, title: true, price: true, rent_amount: true, city: true, locality: true } }
        }
    });

    await prisma.adminAction.create({
        data: {
            admin_id: adminId,
            action_type: `MODERATE_INQUIRY_${status.toUpperCase()}`,
            target_type: "booking",
            target_id: bookingId,
            notes: notes || `Inquiry status set to ${status}`
        }
    });

    return booking;
};

export const verifyUserService = async (adminId: string, userId: string, status: string, reason?: string) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { verification_status: status }
    });

    await prisma.userDocument.updateMany({
        where: { user_id: userId, status: "pending" },
        data: { status: status === "verified" ? "verified" : "rejected" }
    });

    await prisma.adminAction.create({
        data: {
            admin_id: adminId,
            action_type: status === "verified" ? "VERIFY_USER" : "REJECT_USER_VERIFICATION",
            target_type: "user",
            target_id: userId,
            notes: `Verification status changed to ${status}. Notes: ${reason || "N/A"}`,
        }
    });

    return user;
};

export const getReviewsService = async () => {
    return prisma.review.findMany({
        include: {
            reviewer: { select: { id: true, full_name: true, email: true, profile_photo_url: true } },
            reviewee: { select: { id: true, full_name: true, email: true } },
            room: { select: { id: true, title: true } }
        },
        orderBy: { created_at: "desc" }
    });
};

export const moderateReviewService = async (adminId: string, reviewId: string, status: string) => {
    const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { moderation_status: status },
        include: {
            reviewer: { select: { id: true, full_name: true } },
            room: { select: { id: true, title: true } }
        }
    });

    await prisma.adminAction.create({
        data: {
            admin_id: adminId,
            action_type: "moderate_review",
            target_type: "review",
            target_id: reviewId,
            notes: `Status set to ${status}`,
        }
    });

    return updated;
};

export const deleteReviewService = async (adminId: string, reviewId: string) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { room: true }
    });
    if (!review) throw new Error("Review not found");

    await prisma.review.delete({
        where: { id: reviewId }
    });

    await prisma.adminAction.create({
        data: {
            admin_id: adminId,
            action_type: "delete_review",
            target_type: "review",
            target_id: reviewId,
            notes: `Review on room "${review.room.title}" was deleted.`,
        }
    });

    return { message: "Review deleted successfully" };
};

export const getReportedConversationMessagesService = async (conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            tenant: { select: { id: true, full_name: true, email: true, profile_photo_url: true } },
            owner: { select: { id: true, full_name: true, email: true, profile_photo_url: true } },
            room: { select: { id: true, title: true, price: true, rent_amount: true, city: true, images: { take: 1, select: { file_url: true } } } },
            messages: {
                orderBy: { created_at: "asc" },
                include: {
                    sender: { select: { id: true, full_name: true, role: true } },
                    attachments: true
                }
            }
        }
    });

    if (!conversation) throw new Error("Conversation not found");
    return conversation;
};

