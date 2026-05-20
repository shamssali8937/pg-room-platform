import { prisma } from "../config/prisma.js";

export const createReviewService = async (reviewerId: string, data: any) => {
    return prisma.review.create({
        data: {
            reviewer_id: reviewerId,
            reviewee_id: data.revieweeId,
            room_id: data.roomId,
            booking_id: data.bookingId,
            rating: data.rating,
            comment: data.comment,
        }
    });
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
