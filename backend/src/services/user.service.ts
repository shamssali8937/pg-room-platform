import { prisma } from "../config/prisma.js";
import { uploadToCloudinary } from "../utils/upload.js";

export const getMeService = async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
            mobile_number: true,
            profile_photo_url: true,
            city: true,
            account_status: true,
            email_verified_at: true,
            mobile_verified_at: true,
            verification_status: true,
            card_number: true,
            card_expiry: true,
            card_cvv: true,
            card_holder: true,
            balance: true,
            created_at: true,
            updated_at: true,
        },
    });
};

export const saveCardService = async (userId: string, data: { card_number: string; card_expiry: string; card_cvv: string; card_holder: string }) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            card_number: data.card_number,
            card_expiry: data.card_expiry,
            card_cvv: data.card_cvv,
            card_holder: data.card_holder,
        },
        select: {
            id: true,
            card_number: true,
            card_expiry: true,
            card_cvv: true,
            card_holder: true,
            balance: true,
        }
    });
};

export const updateMeService = async (userId: string, data: any, file?: Express.Multer.File) => {
    let profile_photo_url = data.profile_photo_url;
    if (file) {
        const result: any = await uploadToCloudinary(file.buffer);
        profile_photo_url = result.secure_url;
    }
    const { full_name, mobile_number, city } = data;
    return prisma.user.update({
        where: { id: userId },
        data: {
            ...(full_name && { full_name }),
            ...(mobile_number && { mobile_number }),
            ...(city && { city }),
            ...(profile_photo_url && { profile_photo_url }),
        },
        select: {
            id: true, full_name: true, email: true, role: true, mobile_number: true,
            profile_photo_url: true, city: true, account_status: true,
            email_verified_at: true, mobile_verified_at: true, created_at: true,
        },
    });
};

export const getMyNotificationsService = async (userId: string) => {
    return prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
    });
};

export const markNotificationReadService = async (userId: string, notificationId: string) => {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });

    if (!notification || notification.user_id !== userId) {
        throw new Error("Notification not found");
    }

    return prisma.notification.update({
        where: { id: notificationId },
        data: { is_read: true },
    });
};

export const uploadDocumentService = async (userId: string, docType: string, file: Express.Multer.File) => {
    // Upload to Cloudinary
    const result: any = await uploadToCloudinary(file.buffer);

    // Upsert the document (one doc per type per user)
    return prisma.userDocument.upsert({
        where: {
            // We need to find by user_id + doc_type
            id: (await prisma.userDocument.findFirst({ where: { user_id: userId, doc_type: docType } }))?.id ?? "new",
        },
        create: {
            user_id: userId,
            doc_type: docType,
            file_url: result.secure_url,
            status: "pending",
        },
        update: {
            file_url: result.secure_url,
            status: "pending",
        },
    });
};

export const getMyDocumentsService = async (userId: string) => {
    return prisma.userDocument.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
    });
};