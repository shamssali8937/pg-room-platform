/**
 * Room validation schemas using Zod.
 */
import { z } from "zod";

export const createRoomSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title must be at least 5 characters").max(150),
        description: z.string().min(20, "Description must be at least 20 characters").max(2000).optional(),
        city: z.string().min(2, "City is required"),
        locality: z.string().min(2, "Locality is required").optional(),
        room_type: z.string().min(1, "Room type is required"),
        furnished_status: z.enum(["furnished", "semi-furnished", "unfurnished"]).optional(),
        beds: z.coerce.number().int().min(1).max(20).optional(),
        baths: z.coerce.number().int().min(1).max(10).optional(),
        price: z.coerce.number().min(1000, "Rent must be at least 1000").optional(),
        rent_amount: z.coerce.number().min(1000).optional(),
        security_deposit_amount: z.coerce.number().min(0).optional(),
        available_for: z.enum(["male", "female", "family", "any"]).optional(),
        gender_preference: z.enum(["male", "female", "any"]).optional(),
    }),
});

export const updateRoomSchema = z.object({
    body: z.object({
        title: z.string().min(5).max(150).optional(),
        description: z.string().min(20).max(2000).optional(),
        city: z.string().min(2).optional(),
        locality: z.string().optional(),
        room_type: z.string().optional(),
        furnished_status: z.enum(["furnished", "semi-furnished", "unfurnished"]).optional(),
        beds: z.coerce.number().int().min(1).max(20).optional(),
        baths: z.coerce.number().int().min(1).max(10).optional(),
        price: z.coerce.number().min(0).optional(),
        rent_amount: z.coerce.number().min(0).optional(),
        security_deposit_amount: z.coerce.number().min(0).optional(),
        available_for: z.enum(["male", "female", "family", "any"]).optional(),
        gender_preference: z.enum(["male", "female", "any"]).optional(),
    }),
});

export const reportRoomSchema = z.object({
    body: z.object({
        reason_code: z.string().min(1, "Reason code is required"),
        description: z.string().max(500).optional(),
    }),
});
