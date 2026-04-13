import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "SUPER_SECRET";

export const generateToken = (payload: object) => {
    return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};