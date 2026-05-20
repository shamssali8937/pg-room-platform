import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "SUPER_SECRET";

export const generateAccessToken = (payload: object) => {
    return jwt.sign(payload, SECRET, { expiresIn: "15m" }); // 15 minutes
};

export const generateRefreshToken = (payload: object) => {
    return jwt.sign(payload, SECRET, { expiresIn: "7d" }); // 7 days
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET);
};