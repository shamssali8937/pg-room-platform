import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export const signupService = async (data: any) => {
    const { email, password, full_name, mobile_number, role } = data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password_hash: hashedPassword,
            full_name,
            mobile_number,
            role,
        },
    });

    // remove password before returning
    const { password_hash, ...safeUser } = user;

    return safeUser;
};

export const loginService = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) throw new Error("User not found");

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) throw new Error("Invalid password");

    const token = generateToken({
        id: user.id,
        role: user.role,
    });

    const { password_hash, ...safeUser } = user;

    return { token, user: safeUser };
};