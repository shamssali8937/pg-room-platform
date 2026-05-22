import { prisma } from "../config/prisma.js";

const transformRoom = (room: any) => ({
    id: room.id,
    title: room.title,
    description: room.description,
    city: room.city,
    address: room.address ?? room.locality ?? "",
    locality: room.locality,
    room_type: room.room_type,
    furnished_status: room.furnished_status,
    beds: room.beds,
    baths: room.baths,
    price: room.price ?? room.rent_amount ?? 0,
    rent_amount: room.rent_amount ?? room.price ?? 0,
    price_unit: room.price_unit ?? "month",
    status: room.status,
    is_verified: room.is_verified,
    is_featured: room.is_featured,
    is_boosted: room.is_boosted,
    views: room.views ?? 0,
    amenities: room.amenities_list ?? [],
    rejection_reason: room.rejected_reason ?? null,
    images: (room.images ?? []).map((img: any) => ({
        url: img.file_url,
        public_id: img.file_hash ?? "",
    })),
    owner: room.owner ? {
        id: room.owner.id,
        full_name: room.owner.full_name,
        email: room.owner.email,
    } : undefined,
    owner_id: room.owner_id,
    created_at: room.created_at,
    inquiries: room._count?.bookings ?? 0,
});

export const getOwnerRoomsService = async (ownerId: string) => {
    const rooms = await prisma.room.findMany({
        where: { owner_id: ownerId },
        include: {
            images: { take: 2 },
            owner: { select: { id: true, full_name: true, email: true } },
            _count: { select: { bookings: true } },
        },
        orderBy: { created_at: "desc" },
    });

    return rooms.map(transformRoom);
};

export const getOwnerRoomStatsService = async (ownerId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId, owner_id: ownerId } });
    if (!room) throw new Error("Room not found or unauthorized");

    const savedCount = await prisma.savedRoom.count({ where: { room_id: roomId } });
    const inquiriesCount = await prisma.booking.count({ where: { room_id: roomId } });

    return {
        views: room.views,
        saved: savedCount,
        inquiries: inquiriesCount,
    };
};

export const boostRoomService = async (ownerId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId, owner_id: ownerId } });
    if (!room) throw new Error("Room not found or unauthorized");

    // Check if owner has enough points
    const pointsResult = await prisma.pointsTransaction.aggregate({
        where: { owner_id: ownerId },
        _sum: { points: true },
    });
    const totalPoints = pointsResult._sum.points ?? 0;

    if (totalPoints < 300) throw new Error("Insufficient points. You need at least 300 points to boost.");

    const balanceAfter = totalPoints - 300;

    await prisma.pointsTransaction.create({
        data: {
            owner_id: ownerId,
            room_id: roomId,
            transaction_type: "SPENT",
            points: -300,
            reason_code: "room_boost",
            balance_after: balanceAfter,
        },
    });

    const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: { is_boosted: true },
        include: { images: true },
    });

    return { message: "Room boosted successfully", points_spent: 300, balance_after: balanceAfter, room: transformRoom(updatedRoom) };
};

export const featureRoomService = async (ownerId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId, owner_id: ownerId } });
    if (!room) throw new Error("Room not found or unauthorized");

    const pointsResult = await prisma.pointsTransaction.aggregate({
        where: { owner_id: ownerId },
        _sum: { points: true },
    });
    const totalPoints = pointsResult._sum.points ?? 0;

    if (totalPoints < 500) throw new Error("Insufficient points. You need at least 500 points to feature.");

    const balanceAfter = totalPoints - 500;

    await prisma.pointsTransaction.create({
        data: {
            owner_id: ownerId,
            room_id: roomId,
            transaction_type: "SPENT",
            points: -500,
            reason_code: "room_feature",
            balance_after: balanceAfter,
        },
    });

    const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: { is_featured: true },
        include: { images: true },
    });

    return { message: "Room featured successfully", points_spent: 500, balance_after: balanceAfter, room: transformRoom(updatedRoom) };
};

export const getOwnerPointsService = async (ownerId: string) => {
    const pointsResult = await prisma.pointsTransaction.aggregate({
        where: { owner_id: ownerId },
        _sum: { points: true },
    });

    const total = pointsResult._sum.points ?? 0;

    return { points: total, total };
};

export const getOwnerPointTransactionsService = async (ownerId: string) => {
    return prisma.pointsTransaction.findMany({
        where: { owner_id: ownerId },
        include: { room: { select: { id: true, title: true } } },
        orderBy: { created_at: "desc" },
    });
};
