import { prisma } from "../config/prisma.js";
import { uploadToCloudinary, uploadWithModeration } from "../utils/upload.js";
import { getIO } from "../config/socket.js";
import { logger } from "../config/logger.js";
import { getOrSet, invalidateCache } from "../utils/cache.js";
import { redis } from "../config/redis.js";

// ─── Redis-backed cache for the public rooms listing ─────────────────────────
// Replaces the previous in-memory Map — now survives server restarts and works
// across multiple Node.js instances. TTL: 30 seconds.
const ROOMS_CACHE_TTL_S = 120; // 2 minutes — safe because mutations call invalidateRoomsCache()

const getRoomsCacheKey = (query: any): string => {
    const params = JSON.stringify({
        city: query.city,
        min_price: query.min_price,
        max_price: query.max_price,
        beds: query.beds,
        room_type: query.room_type,
        furnished_status: query.furnished_status,
        gender_preference: query.gender_preference,
        availability_date: query.availability_date,
        amenities: query.amenities,
        sort: query.sort,
        search: query.search,
        page: query.page ?? 1,
        limit: query.limit ?? 12,
        status: query.status,
    });
    // Use a short hash as the key suffix to keep Redis keys readable
    return `rooms:list:${Buffer.from(params).toString("base64url").slice(0, 64)}`;
};

/** Bust all rooms listing cache entries (e.g. after create/update/delete). */
export const invalidateRoomsCache = () => invalidateCache("rooms:list:*");

/** Bust all specific room detail cache entries and owner listing caches. */
export const invalidateRoomCache = async (roomId: string, ownerId: string) => {
    invalidateRoomsCache();
    await invalidateCache(`rooms:detail:${roomId}`);
    await invalidateCache(`owner:rooms:${ownerId}`);
};

// ─── Shared room transform to normalize field names for frontend ──────────────
// Privacy: exposes only name + avatar for owner; exact address and phone are stripped.
const transformRoom = (room: any) => ({
    id: room.id,
    title: room.title,
    description: room.description,
    city: room.city,
    // User requested full address exposure to tenant:
    address: room.address ?? "",
    locality: room.locality,
    landmark: room.landmark ?? null,
    approximate_latitude: room.approximate_latitude ?? null,
    approximate_longitude: room.approximate_longitude ?? null,
    room_type: room.room_type,
    furnished_status: room.furnished_status,
    beds: room.beds,
    baths: room.baths,
    sqft: room.size_value,
    size_value: room.size_value,
    price: room.price ?? room.rent_amount ?? 0,
    rent_amount: room.rent_amount ?? room.price ?? 0,
    price_unit: room.price_unit ?? "month",
    security_deposit_amount: room.security_deposit_amount,
    available_for: room.available_for,
    availability_date: room.availability_date ?? null,
    gender_preference: room.gender_preference ?? "any",
    amenities: room.amenities_list ?? [],
    amenities_list: room.amenities_list ?? [],
    rules_json: room.rules_json ?? null,
    status: room.status,
    is_verified: room.is_verified,
    is_featured: room.is_featured,
    is_boosted: room.is_boosted,
    views: room.views ?? 0,
    rating: room.rating,
    review_count: room.review_count,
    rejection_reason: room.rejected_reason ?? null,
    rejected_reason: room.rejected_reason ?? null,
    images: (room.images ?? []).map((img: any) => ({
        url: img.file_url,
        public_id: img.file_hash ?? "",
    })),
    // Privacy: owner object intentionally omits mobile_number and email (SRS §6.4, §10.1)
    owner: room.owner ? {
        id: room.owner.id,
        full_name: room.owner.full_name,
        profile_photo_url: room.owner.profile_photo_url ?? null,
        verification_status: room.owner.verification_status,
    } : undefined,
    owner_id: room.owner_id,
    created_at: room.created_at,
    updated_at: room.updated_at ?? null,
    inquiries: room._count?.bookings ?? 0,
});

export const createRoomService = async (userId: string, data: any, files: any) => {
    const {
        amenities,
        title,
        description,
        city,
        address,
        locality,
        landmark,
        room_type,
        furnished_status = "unfurnished",
        beds,
        baths,
        price,
        rent_amount,
        price_unit = "month",
        security_deposit_amount = 0,
        available_for = "any",
        gender_preference = "any",
        sqft,
        size_value,
        availability_date,
        approximate_latitude,
        approximate_longitude,
        latitude,
        longitude,
    } = data;

    const finalPrice = Number(price ?? rent_amount ?? 0);

    const latVal = approximate_latitude ?? latitude;
    const lngVal = approximate_longitude ?? longitude;
    const parsedLat = latVal !== undefined && latVal !== null && latVal !== "" ? Number(latVal) : null;
    const parsedLng = lngVal !== undefined && lngVal !== null && lngVal !== "" ? Number(lngVal) : null;

    // 1. Min 3 / max 10 photo enforcement (Phase 8)
    const imageCount = files ? files.length : 0;
    if (imageCount < 3) {
        throw new Error("You must upload at least 3 photos for your room listing.");
    }
    if (imageCount > 10) {
        throw new Error("You cannot upload more than 10 photos for your room listing.");
    }

    // 2. Resolve amenities early so we can write them in the initial room.create (no extra UPDATE round trip)
    const rawAmenities = amenities ?? data["amenities[]"] ?? data["amenities"];
    const amenityList: string[] = rawAmenities
        ? (Array.isArray(rawAmenities) ? rawAmenities : [rawAmenities])
        : [];

    // 3. Start ALL Cloudinary uploads immediately in parallel — they'll run while the
    //    duplicate-check DB query is in flight, overlapping ~500ms of network latency.
    //    Gap 2: Use moderation-enabled upload for NSFW detection on room images.
    const uploadPromises = (files ?? []).map((file: any, idx: number) =>
        uploadWithModeration(file.buffer)
            .then((result: any) => ({ secure_url: result.secure_url, public_id: result.public_id, moderation: result.moderation, idx }))
            .catch((e) => {
                console.error("Image upload failed:", e);
                throw new Error(`Image upload failed for photo ${idx + 1}: ${e.message || e}`);
            })
    );

    // 4. Duplicate listing detection (runs in parallel with uploads above)
    const duplicate = await prisma.room.findFirst({
        where: {
            owner_id: userId,
            city: { equals: city, mode: "insensitive" },
            locality: { equals: locality ?? "", mode: "insensitive" },
            address: { equals: address ?? "", mode: "insensitive" },
            price: finalPrice,
            room_type,
        },
        select: { id: true }, // only need to know if a duplicate exists
    });

    if (duplicate) {
        throw new Error("Duplicate listing detected. You have already listed this room with the same address, room type, and price.");
    }

    // 5. Await all uploads (started in step 3)
    const results = await Promise.all(uploadPromises);

    // 6. Create the room and its images in a database transaction to ensure rollback if either fails
    let uploadedImages: Array<{ file_url: string; file_hash: string }> = [];
    const room = await prisma.$transaction(async (tx) => {
        const createdRoom = await tx.room.create({
            data: {
                owner_id: userId,
                title,
                description,
                city,
                address: address ?? locality ?? "",
                locality: locality ?? address ?? "",
                landmark: landmark ?? null,
                approximate_latitude: parsedLat,
                approximate_longitude: parsedLng,
                room_type,
                furnished_status,
                beds: Number(beds ?? 1),
                baths: Number(baths ?? 1),
                size_value: Number(sqft ?? size_value ?? 0),
                price: finalPrice,
                rent_amount: finalPrice,
                price_unit,
                security_deposit_amount: Number(security_deposit_amount),
                available_for,
                gender_preference,
                availability_date: availability_date ? new Date(availability_date) : new Date(),
                status: "pending",
                amenities_list: amenityList,
            },
            include: {
                owner: { select: { id: true, full_name: true, profile_photo_url: true, verification_status: true } },
            },
        });

        if (results.length > 0) {
            await tx.roomImage.createMany({
                data: results.map(r => {
                    const moderationStatus = r.moderation?.some?.((m: any) => m.status === "rejected")
                        ? "rejected" : "approved";
                    return {
                        room_id: createdRoom.id,
                        file_url: r.secure_url,
                        file_hash: r.public_id,
                        sort_order: r.idx,
                        moderation_status: moderationStatus,
                    };
                }),
            });
            uploadedImages = results.map(r => ({ file_url: r.secure_url, file_hash: r.public_id }));
        }

        return createdRoom;
    });

    // 7. Build response from in-memory data — no extra findUnique round trip needed
    await invalidateRoomCache(room.id, userId);
    return transformRoom({ ...room, images: uploadedImages });
};

export const getRoomsService = async (query: any) => {
    const cacheKey = getRoomsCacheKey(query);

    return getOrSet(cacheKey, ROOMS_CACHE_TTL_S, async () => {
    const {
        city,
        min_price,
        max_price,
        beds,
        room_type,
        furnished_status,
        gender_preference,
        availability_date,
        amenities,
        sort,
        search,
        page = 1,
        limit = 12,
        status
    } = query;

    const where: any = {};
    if (status) {
        where.status = status;
    } else {
        where.status = { in: ["active", "booked"] };
    }

    if (city) where.city = { contains: String(city), mode: "insensitive" };
    if (min_price || max_price) {
        where.price = {};
        if (min_price) where.price.gte = Number(min_price);
        if (max_price) where.price.lte = Number(max_price);
    }
    if (beds) where.beds = { gte: Number(beds) };
    
    // Advanced search filters (Phase 6)
    if (room_type) where.room_type = room_type;
    if (furnished_status) where.furnished_status = furnished_status;
    if (gender_preference) where.gender_preference = gender_preference;
    if (availability_date) {
        where.availability_date = { lte: new Date(availability_date) };
    }
    if (amenities) {
        const amenitiesArr = Array.isArray(amenities)
            ? amenities
            : String(amenities).split(",").map((a) => a.trim()).filter(Boolean);
        if (amenitiesArr.length > 0) {
            where.amenities_list = { hasEvery: amenitiesArr };
        }
    }

    if (search) {
        where.OR = [
            { title: { contains: String(search), mode: "insensitive" } },
            { city: { contains: String(search), mode: "insensitive" } },
            { address: { contains: String(search), mode: "insensitive" } },
        ];
    }

    const orderBy: any = sort === "price_asc" ? { price: "asc" }
        : sort === "price_desc" ? { price: "desc" }
        : sort === "newest" ? { created_at: "desc" }
        : sort === "recently_updated" ? { updated_at: "desc" }
        : { views: "desc" };

    const [rooms, total] = await Promise.all([
        prisma.room.findMany({
            where,
            include: {
                // Only select file_url — the only field transformRoom uses from images
                images: { take: 2, select: { file_url: true, file_hash: true } },
                // Privacy: no email/phone in list view owner object
                owner: { select: { id: true, full_name: true, profile_photo_url: true, verification_status: true } },
            },
            orderBy,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        }),
        prisma.room.count({ where }),
    ]);

        return { rooms: rooms.map(transformRoom), total, page: Number(page), limit: Number(limit) };
    }); // end getOrSet
};

export const getRoomByIdService = async (id: string, userId?: string) => {
    const cacheKey = `rooms:detail:${id}`;
    const room = await getOrSet(cacheKey, 300, async () => {
        const fetched = await prisma.room.findUnique({
            where: { id },
            include: {
                images: true,
                amenities: { include: { amenity: true } },
                // Privacy: intentionally omit mobile_number and email (SRS §6.4, §10.1)
                owner: { select: { id: true, full_name: true, profile_photo_url: true, verification_status: true } },
            },
        });
        if (!fetched) throw new Error("Room not found");
        return fetched;
    });

    let shouldIncrement = true;
    if (userId && redis) {
        try {
            // SADD returns 1 if the element was added, 0 if it was already in the set
            const added = await redis.sadd(`user:views:${userId}`, id);
            if (added === 0) {
                shouldIncrement = false;
            }
        } catch (err) {
            logger.error("Failed to check/add room view in Redis", { userId, roomId: id, error: err });
        }
    }

    // Increment view count only if it's a unique view for this user (or guest)
    if (shouldIncrement) {
        prisma.room.update({ where: { id }, data: { views: { increment: 1 } } })
            .then(async (updatedRoom) => {
                try {
                    const io = getIO();
                    io.to(`user:${updatedRoom.owner_id}`).emit("room_viewed", {
                        roomId: updatedRoom.id,
                        views: updatedRoom.views
                    });
                    // Invalidate detail cache so next hits read updated views
                    await invalidateCache(`rooms:detail:${id}`);
                } catch (err) {
                    // socket not initialized yet or other issues
                }
            })
            .catch((err) => {
                logger.error("Failed to increment room views", { roomId: id, error: err });
            });
    }

    return transformRoom(room);
};

export const updateRoomService = async (userId: string, roomId: string, data: any, files?: any) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error("Room not found");
    if (room.owner_id !== userId) throw new Error("Unauthorized");

    const { price, rent_amount, amenities, ...rest } = data;
    delete rest["remaining_images"];
    delete rest["remaining_images[]"];
    const finalPrice = price ?? rent_amount ?? undefined;

    const updateData: any = { ...rest };
    if (updateData.beds !== undefined) updateData.beds = Number(updateData.beds);
    if (updateData.baths !== undefined) updateData.baths = Number(updateData.baths);
    if (updateData.size_value !== undefined) updateData.size_value = Number(updateData.size_value);
    if (updateData.sqft !== undefined) {
        updateData.size_value = Number(updateData.sqft);
        delete updateData.sqft;
    }
    if (updateData.security_deposit_amount !== undefined) {
        updateData.security_deposit_amount = Number(updateData.security_deposit_amount);
    }
    if (updateData.availability_date !== undefined) {
        updateData.availability_date = new Date(updateData.availability_date);
    }
    if (updateData.approximate_latitude !== undefined) {
        updateData.approximate_latitude = updateData.approximate_latitude !== null && updateData.approximate_latitude !== "" ? Number(updateData.approximate_latitude) : null;
    }
    if (updateData.latitude !== undefined) {
        updateData.approximate_latitude = updateData.latitude !== null && updateData.latitude !== "" ? Number(updateData.latitude) : null;
        delete updateData.latitude;
    }
    if (updateData.approximate_longitude !== undefined) {
        updateData.approximate_longitude = updateData.approximate_longitude !== null && updateData.approximate_longitude !== "" ? Number(updateData.approximate_longitude) : null;
    }
    if (updateData.longitude !== undefined) {
        updateData.approximate_longitude = updateData.longitude !== null && updateData.longitude !== "" ? Number(updateData.longitude) : null;
        delete updateData.longitude;
    }

    const finalAmenities = amenities ?? data["amenities[]"] ?? data["amenities"];

    // 1. Start uploads for any new files
    const uploadPromises = (files ?? []).map((file: any, idx: number) =>
        uploadWithModeration(file.buffer)
            .then((result: any) => ({ secure_url: result.secure_url, public_id: result.public_id, idx }))
            .catch((e) => {
                console.error("Image upload failed:", e);
                throw new Error(`Image upload failed for photo ${idx + 1}: ${e.message || e}`);
            })
    );

    const rawRemaining = data.remaining_images ?? data["remaining_images[]"];
    const isMediaUpdate = rawRemaining !== undefined || (files && files.length > 0);

    let results: any[] = [];
    if (files && files.length > 0) {
        results = await Promise.all(uploadPromises);
    }

    if (isMediaUpdate) {
        const remainingImages: string[] = rawRemaining
            ? (Array.isArray(rawRemaining) ? rawRemaining : [rawRemaining])
            : [];
        const totalImageCount = remainingImages.length + results.length;
        if (totalImageCount < 3) {
            throw new Error("You must have at least 3 photos for your room listing.");
        }
        if (totalImageCount > 10) {
            throw new Error("You cannot have more than 10 photos for your room listing.");
        }
    }

    // 2. Perform updates inside a transaction
    const updated = await prisma.$transaction(async (tx) => {
        if (isMediaUpdate) {
            const remainingImages: string[] = rawRemaining
                ? (Array.isArray(rawRemaining) ? rawRemaining : [rawRemaining])
                : [];

            // Delete removed images
            await tx.roomImage.deleteMany({
                where: {
                    room_id: roomId,
                    NOT: {
                        file_url: { in: remainingImages }
                    }
                }
            });

            // Insert new images
            if (results.length > 0) {
                await tx.roomImage.createMany({
                    data: results.map((r, idx) => ({
                        room_id: roomId,
                        file_url: r.secure_url,
                        file_hash: r.public_id,
                        sort_order: remainingImages.length + idx,
                        moderation_status: "approved"
                    }))
                });
            }
        }

        return await tx.room.update({
            where: { id: roomId },
            data: {
                ...updateData,
                ...(finalPrice !== undefined && { price: Number(finalPrice), rent_amount: Number(finalPrice) }),
                ...(finalAmenities && { amenities_list: Array.isArray(finalAmenities) ? finalAmenities : [finalAmenities] }),
            },
            include: { images: true, owner: { select: { id: true, full_name: true, profile_photo_url: true, verification_status: true } } },
        });
    });

    await invalidateRoomCache(roomId, userId);
    return transformRoom(updated);
};

export const deleteRoomService = async (userId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error("Room not found");
    if (room.owner_id !== userId) throw new Error("Unauthorized");

    await prisma.room.delete({ where: { id: roomId } });
    await invalidateRoomCache(roomId, userId);
    return { message: "Room deleted successfully" };
};

export const saveRoomService = async (userId: string, roomId: string) => {
    const saved = await prisma.savedRoom.create({ data: { user_id: userId, room_id: roomId } });

    // Gap 4: Award 2 points for first-time save (idempotent — one reward per room per tenant)
    try {
        const existingPtsTx = await prisma.pointsTransaction.findFirst({
            where: { owner_id: userId, room_id: roomId, reason_code: "room_saved" }
        });
        if (!existingPtsTx) {
            const currentPts = await prisma.pointsTransaction.aggregate({ where: { owner_id: userId }, _sum: { points: true } });
            const balanceAfter = (currentPts._sum.points ?? 0) + 2;
            await prisma.pointsTransaction.create({
                data: {
                    owner_id: userId,
                    room_id: roomId,
                    transaction_type: "EARNED",
                    points: 2,
                    reason_code: "room_saved",
                    balance_after: balanceAfter,
                    expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                }
            });
        }
    } catch (err) {
        console.error("[TenantPoints] Failed to award room_saved points:", err);
    }

    return saved;
};

export const unsaveRoomService = async (userId: string, roomId: string) => {
    return prisma.savedRoom.delete({
        where: { user_id_room_id: { user_id: userId, room_id: roomId } },
    });
};

export const getSavedRoomsService = async (userId: string) => {
    const saved = await prisma.savedRoom.findMany({
        where: { user_id: userId },
        include: {
            room: {
                include: {
                    images: { take: 1 },
                    owner: { select: { id: true, full_name: true, email: true, profile_photo_url: true, verification_status: true } },
                },
            },
        },
        orderBy: { created_at: "desc" },
    });

    return saved.map((s) => transformRoom(s.room));
};

export const reportRoomService = async (userId: string, roomId: string, data: any) => {
    return prisma.report.create({
        data: {
            reporter_id: userId,
            target_type: "room",
            target_id: roomId,
            reason_code: data.reason_code ?? "other",
            description: data.description,
        },
    });
};

export const submitRoomService = async (userId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error("Room not found");
    if (room.owner_id !== userId) throw new Error("Unauthorized");

    const updated = await prisma.room.update({
        where: { id: roomId },
        data: { status: "pending", rejected_reason: null },
        include: { images: true, owner: { select: { id: true, full_name: true, profile_photo_url: true, verification_status: true } } },
    });

    invalidateRoomsCache(); // status changed to pending — bust the public feed cache
    return transformRoom(updated);
};