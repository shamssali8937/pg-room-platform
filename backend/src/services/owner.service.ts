import { prisma } from "../config/prisma.js";

export const getOwnerRoomsService = async (ownerId: string) => {
    return prisma.room.findMany({
        where: { owner_id: ownerId },
        orderBy: { created_at: "desc" }
    });
};

export const getOwnerRoomStatsService = async (ownerId: string, roomId: string) => {
    // Check ownership
    const room = await prisma.room.findUnique({ where: { id: roomId, owner_id: ownerId } });
    if (!room) throw new Error("Room not found or unauthorized");

    const savedCount = await prisma.savedRoom.count({ where: { room_id: roomId } });
    const inquiriesCount = await prisma.booking.count({ where: { room_id: roomId } });

    return {
        views: 0, // Placeholder
        saved: savedCount,
        inquiries: inquiriesCount
    };
};

export const boostRoomService = async (ownerId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId, owner_id: ownerId } });
    if (!room) throw new Error("Room not found or unauthorized");

    // Implement point deduction logic here...
    return { message: "Room boosted successfully" };
};

export const featureRoomService = async (ownerId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId, owner_id: ownerId } });
    if (!room) throw new Error("Room not found or unauthorized");

    // Implement point deduction logic here...
    return { message: "Room featured successfully" };
};

export const getOwnerPointsService = async (ownerId: string) => {
    const points = await prisma.pointsTransaction.aggregate({
        where: { owner_id: ownerId },
        _sum: { points: true }
    });
    return { total: points._sum.points || 0 };
};

export const getOwnerPointTransactionsService = async (ownerId: string) => {
    return prisma.pointsTransaction.findMany({
        where: { owner_id: ownerId },
        orderBy: { created_at: "desc" }
    });
};
