/**
 * Booking validation schemas using Zod.
 */
import { z } from "zod";

export const createBookingSchema = z.object({
    body: z.object({
        request_type: z.enum(["inquiry", "visit_request"]).optional(),
        message: z.string().max(1000, "Message cannot exceed 1000 characters").optional(),
    }),
});

export const updateBookingStatusSchema = z.object({
    body: z.object({
        status: z.enum(["approved", "rejected", "completed", "closed"],
            { error: "Status must be one of: approved, rejected, completed, closed" }),
        owner_note: z.string().max(500).optional(),
    }),
});
