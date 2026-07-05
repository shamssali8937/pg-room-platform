/**
 * Room validation schemas using Zod.
 */
import { z } from "zod";
import { sanitizeString } from "../utils/sanitize.util.js";

const coerceNumber = (fallback: number, schema: z.ZodNumber, minVal?: number) =>
    z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return fallback;
        let num = Number(val);
        if (isNaN(num)) return fallback;
        if (minVal !== undefined && num < minVal) return minVal;
        return num;
    }, schema);

export const createRoomSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title must be at least 5 characters").max(150).transform(sanitizeString),
        description: z.string().min(20, "Description must be at least 20 characters").max(2000).transform(sanitizeString).optional(),
        city: z.string().min(2, "City is required").transform(sanitizeString),
        locality: z.string().min(2, "Locality is required").transform(sanitizeString).optional(),
        address: z.string().transform(sanitizeString).optional(),
        landmark: z.string().transform(sanitizeString).optional(),
        room_type: z.string().min(1, "Room type is required"),
        furnished_status: z.enum(["furnished", "semi-furnished", "unfurnished"]).optional(),
        beds: coerceNumber(1, z.number().int().min(1).max(20)).optional(),
        baths: coerceNumber(1, z.number().int().min(1).max(10)).optional(),
        price: coerceNumber(1000, z.number().min(1000, "Rent must be at least 1000")).optional(),
        rent_amount: coerceNumber(1000, z.number().min(1000)).optional(),
        price_unit: z.string().optional(),
        security_deposit_amount: coerceNumber(0, z.number().min(0), 0).optional(),
        available_for: z.enum(["students", "professionals", "families", "any"]).optional(),
        gender_preference: z.enum(["male", "female", "any"]).optional(),
        sqft: coerceNumber(0, z.number().min(0), 0).optional(),
        size_value: coerceNumber(0, z.number().min(0), 0).optional(),
        availability_date: z.string().optional(),
        amenities: z.union([z.string(), z.array(z.string())]).optional(),
        "amenities[]": z.union([z.string(), z.array(z.string())]).optional(),
        approximate_latitude: z.union([z.number(), z.string()]).optional().nullable(),
        approximate_longitude: z.union([z.number(), z.string()]).optional().nullable(),
        latitude: z.union([z.number(), z.string()]).optional().nullable(),
        longitude: z.union([z.number(), z.string()]).optional().nullable(),
    }).passthrough(),
});

export const updateRoomSchema = z.object({
    body: z.object({
        title: z.string().min(5).max(150).transform(sanitizeString).optional(),
        description: z.string().min(20).max(2000).transform(sanitizeString).optional(),
        city: z.string().min(2).transform(sanitizeString).optional(),
        locality: z.string().transform(sanitizeString).optional(),
        address: z.string().transform(sanitizeString).optional(),
        landmark: z.string().transform(sanitizeString).optional(),
        room_type: z.string().optional(),
        furnished_status: z.enum(["furnished", "semi-furnished", "unfurnished"]).optional(),
        beds: coerceNumber(1, z.number().int().min(1).max(20)).optional(),
        baths: coerceNumber(1, z.number().int().min(1).max(10)).optional(),
        price: coerceNumber(0, z.number().min(0), 0).optional(),
        rent_amount: coerceNumber(0, z.number().min(0), 0).optional(),
        price_unit: z.string().optional(),
        security_deposit_amount: coerceNumber(0, z.number().min(0), 0).optional(),
        available_for: z.enum(["students", "professionals", "families", "any"]).optional(),
        gender_preference: z.enum(["male", "female", "any"]).optional(),
        sqft: coerceNumber(0, z.number().min(0), 0).optional(),
        size_value: coerceNumber(0, z.number().min(0), 0).optional(),
        availability_date: z.string().optional(),
        amenities: z.union([z.string(), z.array(z.string())]).optional(),
        "amenities[]": z.union([z.string(), z.array(z.string())]).optional(),
        approximate_latitude: z.union([z.number(), z.string()]).optional().nullable(),
        approximate_longitude: z.union([z.number(), z.string()]).optional().nullable(),
        latitude: z.union([z.number(), z.string()]).optional().nullable(),
        longitude: z.union([z.number(), z.string()]).optional().nullable(),
    }).passthrough(),
});

export const reportRoomSchema = z.object({
    body: z.object({
        reason_code: z.string().min(1, "Reason code is required"),
        description: z.string().max(500).optional(),
    }),
});
