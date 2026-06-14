import { prisma } from "../config/prisma.js";

export const createReviewService = async (reviewerId: string, data: any) => {
    // P2-B: Verify the booking exists, belongs to this reviewer, and is completed
    const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
        select: { id: true, tenant_id: true, status: true, room_id: true }
    });

    if (!booking) {
        throw new Error("Booking not found. A valid booking ID is required to leave a review.");
    }

    if (booking.tenant_id !== reviewerId) {
        throw new Error("You can only review rooms from your own bookings.");
    }

    if (booking.status !== "completed") {
        throw new Error("You can only leave a review after your booking has been marked as completed.");
    }

    // P2-B: Prevent duplicate reviews for the same booking
    const existingReview = await prisma.review.findFirst({
        where: { reviewer_id: reviewerId, booking_id: data.bookingId }
    });

    if (existingReview) {
        throw new Error("You have already submitted a review for this booking.");
    }

    const review = await prisma.review.create({
        data: {
            reviewer_id: reviewerId,
            reviewee_id: data.revieweeId,
            room_id: data.roomId ?? booking.room_id,
            booking_id: data.bookingId,
            rating: data.rating,
            comment: data.comment,
        }
    });

    // Gap 4: Award 15 points to tenant for submitting a review
    try {
        const existingPtsTx = await prisma.pointsTransaction.findFirst({
            where: { owner_id: reviewerId, reference_id: data.bookingId, reason_code: "review_submitted" }
        });
        if (!existingPtsTx) {
            const currentPts = await prisma.pointsTransaction.aggregate({ where: { owner_id: reviewerId }, _sum: { points: true } });
            const balanceAfter = (currentPts._sum.points ?? 0) + 15;
            await prisma.pointsTransaction.create({
                data: {
                    owner_id: reviewerId,
                    room_id: data.roomId ?? booking.room_id,
                    transaction_type: "EARNED",
                    points: 15,
                    reason_code: "review_submitted",
                    reference_id: data.bookingId,
                    balance_after: balanceAfter,
                    expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                }
            });
            await prisma.notification.create({
                data: {
                    user_id: reviewerId,
                    notification_type: "points_credited",
                    title: "Points Earned! 🪙",
                    body: `You earned 15 points for leaving a review.`,
                    action_url: `/tenant/bookings`,
                }
            });
        }
    } catch (err) {
        console.error("[TenantPoints] Failed to award review_submitted points:", err);
    }

    return review;
};

export const getRoomReviewsService = async (roomId: string) => {
    return prisma.review.findMany({
        where: { room_id: roomId, moderation_status: "approved" },
        include: { reviewer: { select: { full_name: true, profile_photo_url: true } } },
        orderBy: { created_at: "desc" }
    });
};

export const updateReviewService = async (reviewerId: string, reviewId: string, data: any) => {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review || review.reviewer_id !== reviewerId) throw new Error("Not authorized or not found");

    return prisma.review.update({
        where: { id: reviewId },
        data: { rating: data.rating, comment: data.comment }
    });
};
