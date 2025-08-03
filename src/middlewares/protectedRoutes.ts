import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "../types/httpStatusCodes";
import { config } from "../config";

export const protectRoute = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.accessToken

    if (!token) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Not authenticated" });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwt) as { userId: string };
        req.headers['x-user-id'] = decoded.userId;
        next();
    } catch (err) {
        console.error(err)
        res.status(403).json({ message: "nvalid or expired token" });
        return;
    }
};