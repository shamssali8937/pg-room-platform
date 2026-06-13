import { prisma } from "../config/prisma.js";
import { uploadToCloudinary } from "../utils/upload.js";
import { getIO } from "../config/socket.js";
import { logger } from "../config/logger.js";
import { getOrSet, invalidateCache } from "../utils/cache.js";

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

// ─── Shared room transform to normalize field names for frontend ──────────────
// Privacy: exposes only name + avatar for owner; exact address and phone are stripped.
const transformRoom = (room: any) => ({
    id: room.id,
    title: room.title,
    description: room.description,
    city: room.city,
    // Privacy: do NOT expose raw `address` (may contain exact house/street number).
    // Expose only locality + landmark for approximate location.
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
    } = data;

    const finalPrice = Number(price ?? rent_amount ?? 0);

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
    const uploadPromises = (files ?? []).map((file: any, idx: number) =>
        uploadToCloudinary(file.buffer)
            .then((result: any) => ({ secure_url: result.secure_url, public_id: result.public_id, idx }))
            .catch((e) => { console.error("Image upload failed:", e); return null; })
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

    // 5. Create the room — amenities written here, no separate UPDATE needed
    const room = await prisma.room.create({
        data: {
            owner_id: userId,
            title,
            description,
            city,
            address: address ?? locality ?? "",
            locality: locality ?? address ?? "",
            landmark: landmark ?? null,
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
            amenities_list: amenityList, // ← folded in, no extra UPDATE round trip
        },
        include: {
            owner: { select: { id: true, full_name: true, profile_photo_url: true, verification_status: true } },
        },
    });

    // 6. Await all uploads (started in step 3, should be mostly done by now)
    //    then batch-insert all images with ONE createMany — N uploads → 1 DB round trip
    let uploadedImages: Array<{ file_url: string; file_hash: string }> = [];
    if (files && files.length > 0) {
        const results = (await Promise.all(uploadPromises))
            .filter(Boolean)
            .sort((a, b) => a!.idx - b!.idx);

        if (results.length > 0) {
            await prisma.roomImage.createMany({
                data: results.map(r => ({
                    room_id: room.id,
                    file_url: r!.secure_url,
                    file_hash: r!.public_id,
                    sort_order: r!.idx,
                    moderation_status: "approved",
                })),
            });
            uploadedImages = results.map(r => ({ file_url: r!.secure_url, file_hash: r!.public_id }));
        }
    }

    // 7. Build response from in-memory data — no extra findUnique round trip needed
    invalidateRoomsCache();
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

export const getRoomByIdService = async (id: string) => {
    const room = await prisma.room.findUnique({
        where: { id },
        include: {
            images: true,
            amenities: { include: { amenity: true } },
            // Privacy: intentionally omit mobile_number and email (SRS §6.4, §10.1)
            owner: { select: { id: true, full_name: true, profile_photo_url: true, verification_status: true } },
        },
    });

    if (!room) throw new Error("Room not found");

    // Increment view count
    prisma.room.update({ where: { id }, data: { views: { increment: 1 } } })
        .then(async (updatedRoom) => {
            try {
                const io = getIO();
                io.to(`user:${updatedRoom.owner_id}`).emit("room_viewed", {
                    roomId: updatedRoom.id,
                    views: updatedRoom.views
                });
            } catch (err) {
                // socket not initialized yet or other issues
            }
        })
        .catch((err) => {
            logger.error("Failed to increment room views", { roomId: id, error: err });
        });

    return transformRoom(room);
};

export const updateRoomService = async (userId: string, roomId: string, data: any) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error("Room not found");
    if (room.owner_id !== userId) throw new Error("Unauthorized");

    const { price, rent_amount, amenities, ...rest } = data;
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

    const finalAmenities = amenities ?? data["amenities[]"] ?? data["amenities"];

    const updated = await prisma.room.update({
        where: { id: roomId },
        data: {
            ...updateData,
            ...(finalPrice !== undefined && { price: Number(finalPrice), rent_amount: Number(finalPrice) }),
            ...(finalAmenities && { amenities_list: Array.isArray(finalAmenities) ? finalAmenities : [finalAmenities] }),
        },
        include: { images: true, owner: { select: { id: true, full_name: true, profile_photo_url: true, verification_status: true } } },
    });

    invalidateRoomsCache(); // listing updated — bust the public feed cache
    return transformRoom(updated);
};

export const deleteRoomService = async (userId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error("Room not found");
    if (room.owner_id !== userId) throw new Error("Unauthorized");

    await prisma.room.delete({ where: { id: roomId } });
    invalidateRoomsCache(); // listing deleted — bust the public feed cache
    return { message: "Room deleted successfully" };
};

export const saveRoomService = async (userId: string, roomId: string) => {
    return prisma.savedRoom.create({ data: { user_id: userId, room_id: roomId } });
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