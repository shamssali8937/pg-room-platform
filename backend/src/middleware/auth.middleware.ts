import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isBlacklisted } from "../utils/tokenBlacklist.js";

const SECRET = process.env.JWT_SECRET as string;

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1] as string;

        if (isBlacklisted(token)) {
            return res.status(401).json({ message: "Token expired (logged out)" });
        }

        const decoded = jwt.verify(token, SECRET) as any;

        req.user = decoded; // attach user

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};