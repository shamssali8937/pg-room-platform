import { prisma } from "../config/prisma.js";

export const getMeService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const { password_hash, ...safeUser } = user;

    return safeUser;
};

export const updateMeService = async (userId: string, data: any) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data,
    });

    const { password_hash, ...safeUser } = user;

    return safeUser;
};