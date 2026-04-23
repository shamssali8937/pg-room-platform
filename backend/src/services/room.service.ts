import { prisma } from "../config/prisma.js";
import { uploadToCloudinary } from "../utils/upload.js";
export const createRoomService = async (userId: string, data: any, files: any) => {
    const { amenities, ...roomData } = data;

    const room = await prisma.room.create({
        data: {
            ...roomData,
            owner_id: userId,
        },
    });
    if (files && files.length > 0) {
        const uploadedImages = await Promise.all(
            files.map(async (file: any) => {
                const result: any = await uploadToCloudinary(file.buffer);

                return prisma.roomImage.create({
                    data: {
                        room_id: room.id,
                        file_url: result.secure_url,
                        file_hash: result.public_id,
                    },
                });
            })
        );
    }

    if (amenities?.length) {
        await prisma.roomAmenity.createMany({
            data: amenities.map((id: string) => ({
                room_id: room.id,
                amenity_id: id,
            })),
        });
    }

    return room;
};


export const getRoomsService = async (query: any) => {
    const {
        city,
        minRent,
        maxRent,
        page = 1,
        limit = 10,
    } = query;

    const rentFilter: any = {};
    if (minRent !== undefined) rentFilter.gte = Number(minRent);
    if (maxRent !== undefined) rentFilter.lte = Number(maxRent);

    return prisma.room.findMany({
        where: {
            status: "approved",
            // Only add city if it exists
            ...(city && { city: String(city) }),
            // Only add rent_amount if filters were built
            ...(Object.keys(rentFilter).length > 0 && { rent_amount: rentFilter }),
        },
        include: {
            images: true,
            amenities: {
                include: { amenity: true },
            },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { created_at: "desc" },
    });
};

export const getRoomByIdService = async (id: string) => {
    const room = await prisma.room.findUnique({
        where: { id },
        include: {
            images: true,
            amenities: {
                include: { amenity: true },
            },
            owner: true,
        },
    });

    if (!room) throw new Error("Room not found");
    if (room.status !== "approved") throw new Error("Not available");

    return room;
};

export const updateRoomService = async (
    userId: string,
    roomId: string,
    data: any
) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!room) throw new Error("Room not found");
    if (room.owner_id !== userId) throw new Error("Unauthorized");

    return prisma.room.update({
        where: { id: roomId },
        data,
    });
};


export const deleteRoomService = async (userId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!room) throw new Error("Room not found");
    if (room.owner_id !== userId) throw new Error("Unauthorized");

    await prisma.room.delete({ where: { id: roomId } });

    return { message: "Room deleted" };
};

export const saveRoomService = async (userId: string, roomId: string) => {
    return prisma.savedRoom.create({
        data: {
            user_id: userId,
            room_id: roomId,
        },
    });
};


export const unsaveRoomService = async (userId: string, roomId: string) => {
    return prisma.savedRoom.delete({
        where: {
            user_id_room_id: {
                user_id: userId,
                room_id: roomId,
            },
        },
    });
};


export const getSavedRoomsService = async (userId: string) => {
    return prisma.savedRoom.findMany({
        where: { user_id: userId },
        include: { room: true },
    });
};

/* ================= REPORT ROOM ================= */
export const reportRoomService = async (
    userId: string,
    roomId: string,
    data: any
) => {
    return prisma.report.create({
        data: {
            reporter_id: userId,
            target_type: "room",
            target_id: roomId,
            reason_code: data.reason_code,
            description: data.description,
        },
    });
};


export const submitRoomService = async (userId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!room) throw new Error("Room not found");
    if (room.owner_id !== userId) throw new Error("Unauthorized");

    return prisma.room.update({
        where: { id: roomId },
        data: { status: "pending" },
    });
};