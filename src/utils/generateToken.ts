import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { IUser } from "../models/user/IUser";
import { config } from "../config";


export const generateAccessToken = (userId: string, email: string): string => {
    const payload: JwtPayload = {
        userId,
        email
    };

    const options: SignOptions = {
        expiresIn: "15m"
    };

    return jwt.sign(payload, config.jwt, options);
};

export const generateRefreshToken = (userId: string): string => {
    const payload: JwtPayload = {
        userId
    };

    const options: SignOptions = {
        expiresIn: "7d"
    };

    return jwt.sign(payload, config.jwt, options);
};