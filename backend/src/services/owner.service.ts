import { prisma } from "../config/prisma.js";

const transformRoom = (room: any) => ({
    id: room.id,
    title: room.title,
    description: room.description,
    city: room.city,
    address: room.address ?? room.locality ?? "",
    locality: room.locality,
    landmark: room.landmark,
    room_type: room.room_type,
    furnished_status: room.furnished_status,
    beds: room.beds,
    baths: room.baths,
    size_value: room.size_value,
    price: room.price ?? room.rent_amount ?? 0,
    rent_amount: room.rent_amount ?? room.price ?? 0,
    price_unit: room.price_unit ?? "month",
    security_deposit_amount: room.security_deposit_amount,
    available_for: room.available_for,
    availability_date: room.availability_date ?? null,
    gender_preference: room.gender_preference ?? "any",
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
            images: true,
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

    if (room.is_boosted) {
        throw new Error("This listing is already boosted.");
    }

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

    try {
        await prisma.notification.create({
            data: {
                user_id: ownerId,
                notification_type: "points_deducted",
                title: "Points Deducted 🪙",
                body: `You spent 300 points to boost your room "${room.title}".`,
                action_url: `/owner/wallet`
            }
        });
    } catch (err) {
        console.error("[Notification] Failed to create points deduction notification:", err);
    }

    const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: { 
            is_boosted: true,
            boost_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        include: { images: true },
    });

    return { message: "Room boosted successfully", points_spent: 300, balance_after: balanceAfter, room: transformRoom(updatedRoom) };
};

export const featureRoomService = async (ownerId: string, roomId: string) => {
    const room = await prisma.room.findUnique({ where: { id: roomId, owner_id: ownerId } });
    if (!room) throw new Error("Room not found or unauthorized");

    if (room.is_featured) {
        throw new Error("This listing is already featured.");
    }

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

    try {
        await prisma.notification.create({
            data: {
                user_id: ownerId,
                notification_type: "points_deducted",
                title: "Points Deducted 🪙",
                body: `You spent 500 points to feature your room "${room.title}".`,
                action_url: `/owner/wallet`
            }
        });
    } catch (err) {
        console.error("[Notification] Failed to create points deduction notification:", err);
    }

    const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: { 
            is_featured: true,
            featured_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        include: { images: true },
    });

    return { message: "Room featured successfully", points_spent: 500, balance_after: balanceAfter, room: transformRoom(updatedRoom) };
};

export const certifyOwnerService = async (ownerId: string) => {
    const pointsResult = await prisma.pointsTransaction.aggregate({
        where: { owner_id: ownerId },
        _sum: { points: true },
    });
    const totalPoints = pointsResult._sum.points ?? 0;

    if (totalPoints < 1250) {
        throw new Error("Insufficient points. You need 1,250 points to activate Elite Profile Certification.");
    }

    const balanceAfter = totalPoints - 1250;

    await prisma.$transaction(async (tx) => {
        await tx.pointsTransaction.create({
            data: {
                owner_id: ownerId,
                transaction_type: "SPENT",
                points: -1250,
                reason_code: "elite_certification",
                balance_after: balanceAfter,
            },
        });

        await tx.user.update({
            where: { id: ownerId },
            data: { 
                verification_status: "verified",
                certification_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        await tx.notification.create({
            data: {
                user_id: ownerId,
                notification_type: "points_deducted",
                title: "Elite Certification Activated! 🪙",
                body: "You spent 1,250 points for Elite Profile Certification. Your profile is now verified.",
                action_url: `/owner/wallet`,
            },
        });
    });

    return { message: "Elite Certification activated successfully", points_spent: 1250, balance_after: balanceAfter };
};

export const activateNewsletterService = async (ownerId: string) => {
    const pointsResult = await prisma.pointsTransaction.aggregate({
        where: { owner_id: ownerId },
        _sum: { points: true },
    });
    const totalPoints = pointsResult._sum.points ?? 0;

    if (totalPoints < 820) {
        throw new Error("Insufficient points. You need 820 points to activate Newsletter Feature.");
    }

    const balanceAfter = totalPoints - 820;

    await prisma.$transaction(async (tx) => {
        await tx.pointsTransaction.create({
            data: {
                owner_id: ownerId,
                transaction_type: "SPENT",
                points: -820,
                reason_code: "newsletter_feature",
                balance_after: balanceAfter,
            },
        });

        await tx.notification.create({
            data: {
                user_id: ownerId,
                notification_type: "points_deducted",
                title: "Newsletter Feature Activated! 🪙",
                body: "You spent 820 points to feature your listings in the weekly Curator's Choice newsletter.",
                action_url: `/owner/wallet`,
            },
        });
    });

    return { message: "Newsletter feature activated successfully", points_spent: 820, balance_after: balanceAfter };
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

export const buyPointsService = async (ownerId: string, packageId: string) => {
    // 1. Determine points and amount based on packageId
    let pointsToAdd = 0;
    let costAmount = 0.0;
    let reasonText = "";

    if (packageId === "starter") {
        pointsToAdd = 100;
        costAmount = 500.0;
        reasonText = "starter_points_package";
    } else if (packageId === "growth") {
        pointsToAdd = 500;
        costAmount = 2000.0;
        reasonText = "growth_points_package";
    } else if (packageId === "elite") {
        pointsToAdd = 1500;
        costAmount = 5000.0;
        reasonText = "elite_points_package";
    } else {
        throw new Error("Invalid points package selection");
    }

    // 2. Fetch owner and validate debit card attachment
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) throw new Error("Owner not found");
    if (!owner.card_number) {
        throw new Error("No payment method configured. Please attach a debit card in settings first.");
    }

    // 3. Check if owner has sufficient balance
    if (owner.balance < costAmount) {
        throw new Error(`Insufficient funds. Package costs PKR ${costAmount.toLocaleString()}, but your card account balance is PKR ${owner.balance.toLocaleString()}.`);
    }

    // 4. Find the first admin user to transfer the funds to
    const admin = await prisma.user.findFirst({ where: { role: "admin" } });

    // 5. Run a database transaction to deduct, transfer, update balance, and create transaction records
    const result = await prisma.$transaction(async (tx) => {
        // Deduct from owner
        const updatedOwner = await tx.user.update({
            where: { id: ownerId },
            data: { balance: { decrement: costAmount } },
        });

        // Transfer to admin (if admin exists)
        if (admin) {
            await tx.user.update({
                where: { id: admin.id },
                data: { balance: { increment: costAmount } },
            });
        }

        // Calculate points balance after
        const currentPointsResult = await tx.pointsTransaction.aggregate({
            where: { owner_id: ownerId },
            _sum: { points: true },
        });
        const currentPoints = currentPointsResult._sum.points ?? 0;
        const balanceAfter = currentPoints + pointsToAdd;

        // Create points transaction
        const ptsTx = await tx.pointsTransaction.create({
            data: {
                owner_id: ownerId,
                transaction_type: "EARNED",
                points: pointsToAdd,
                reason_code: reasonText,
                balance_after: balanceAfter,
            },
        });

        // Create notification for credited points
        await tx.notification.create({
            data: {
                user_id: ownerId,
                notification_type: "points_credited",
                title: "Points Purchased! 🪙",
                body: `You purchased and were credited with ${pointsToAdd} points.`,
                action_url: `/owner/wallet`
            }
        });

        return {
            updatedOwner,
            ptsTx,
            points: balanceAfter,
        };
    });

    return {
        message: `Successfully purchased points!`,
        points: result.points,
        balance: result.updatedOwner.balance,
        transaction: result.ptsTx,
    };
};
