import { prisma } from "../config/prisma.js";
import { uploadToCloudinary } from "../utils/upload.js";

export const getMeService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const { password_hash, ...safeUser } = user;

    return safeUser;
};

export const updateMeService = async (
    userId: string,
    data: any,
    file?: Express.Multer.File
) => {
    let imageUrl;

    if (file) {
        const uploadResult: any = await uploadToCloudinary(file);
        imageUrl = uploadResult.secure_url;
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...data,
            ...(imageUrl && { profile_photo_url: imageUrl }),
        },
    });

    const { password_hash, ...safeUser } = user;

    return safeUser;
};