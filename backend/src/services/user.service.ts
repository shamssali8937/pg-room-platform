import { prisma } from "../config/prisma.js";

export const getMeService = async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
    });
};

export const updateMeService = async (userId: string, data: any) => {
    return prisma.user.update({
        where: { id: userId },
        data,
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