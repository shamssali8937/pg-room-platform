/**
 * Review validation schemas using Zod.
 */
import { z } from "zod";

export const createReviewSchema = z.object({
    body: z.object({
        bookingId: z.string().uuid("bookingId must be a valid UUID"),
        revieweeId: z.string().uuid("revieweeId must be a valid UUID"),
        roomId: z.string().uuid("roomId must be a valid UUID").optional(),
        rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
        comment: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review cannot exceed 1000 characters").optional(),
    }),
});

export const updateReviewSchema = z.object({
    body: z.object({
        rating: z.number().int().min(1).max(5).optional(),
        comment: z.string().min(10).max(1000).optional(),
    }),
});

export const reportReviewSchema = z.object({
    body: z.object({
        reason_code: z.string().min(1, "Reason code is required"),
        description: z.string().max(500).optional(),
    }),
});
