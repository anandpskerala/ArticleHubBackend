import { Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "../models/user/IUser";
import userModel from "../models/user/model";
import { HttpStatusCode } from "../types/httpStatusCodes";
import { Response } from "express";
import { config } from "../config";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";

export class AuthService {
    private readonly model: Model<IUser>;
    constructor() {
        this.model = userModel
    }

    public async registerUser(user: Partial<IUser>, res: Response) {
        try {
            const existingUser = await this.model.findOne({ $or: [{ email: user.email }, { phone: user.phone }] });
            if (existingUser) {
                return {
                    message: "User already exists",
                    status: HttpStatusCode.BAD_REQUEST
                }
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password as string, salt);

            const newUser = await this.model.create({
                ...user,
                password: hashedPassword
            });

            const refreshToken = await generateRefreshToken(newUser.id);
            const accessToken = await generateAccessToken(newUser.id, newUser.email);

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: config.env === "production",
                sameSite: 'none',
                maxAge: 15 * 60 * 1000
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: config.env === "production",
                sameSite: 'none',
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return {
                message: "Signup successsful",
                status: HttpStatusCode.OK,
                user: newUser.toJSON()
            }
        } catch (error) {
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async loginUser(emailOrPhone: string, password: string, res: Response) {
        try {
            const user = await this.model.findOne({
                $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
            });

            if (!user) {
                return {
                    message: "Invalid credentials",
                    status: HttpStatusCode.FORBIDDEN
                }
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return {
                    message: "Invalid credentials",
                    status: HttpStatusCode.FORBIDDEN
                }
            }

            const refreshToken = await generateRefreshToken(user.id);
            const accessToken = await generateAccessToken(user.id, user.email);

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: config.env === "production",
                sameSite: 'none',
                maxAge: 15 * 60 * 1000
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: config.env === "production",
                sameSite: 'none',
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return {
                message: "Login successsful",
                status: HttpStatusCode.OK,
                user: user.toJSON()
            }
        } catch (error) {
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async refreshToken(token: string, res: Response) {
        try {
            if (!token) {
                return {
                    message: "Refresh token not found",
                    status: HttpStatusCode.UNAUTHORIZED
                }
            }

            const decoded = jwt.verify(token, config.jwt) as { userId: string };

            const user = await this.model.findById(decoded.userId);
            if (!user) {
                return {
                    message: "User not found",
                    status: HttpStatusCode.NOT_FOUND
                }
            }

            const accessToken = await generateAccessToken(user.id, user.email);
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: config.env === "production",
                sameSite: 'none',
                maxAge: 15 * 60 * 1000
            });

            return {
                message: "Token refreshed",
                status: HttpStatusCode.OK,
                user: user.toJSON(),
            }
        } catch (error) {
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async verifyUser(userId: string) {
        try {
            if (!userId) {
                return {
                    message: "Invalid user Id",
                    status: HttpStatusCode.BAD_REQUEST
                }
            }

            const user = await this.model.findById(userId);
            if (!user) {
                return {
                    message: "User Not found",
                    status: HttpStatusCode.NOT_FOUND
                }
            }

            return {
                message: "",
                status: HttpStatusCode.OK,
                user: user.toJSON(),
            }
        } catch (error) {
            console.error(error)
            return {
                message: "Internal Server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public logOut(res: Response) {
        try {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return {
                message: "Logout successful",
                status: HttpStatusCode.OK
            }
        } catch (error) {
            console.error(error);
            return {
                message: "Internal Server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async changeUserdetails(userData: Partial<IUser & { newPassword: string }>) {
        try {
            const user = await this.model.findOne({ email: userData.email });
            if (!user) {
                return {
                    message: "User not found",
                    status: HttpStatusCode.NOT_FOUND
                }
            }

            user.firstName = userData.firstName as string;
            user.lastName = userData.lastName as string;
            user.phone = userData.phone as string;
            user.interests = userData.interests as string[];
            const isPasswordUpdate = userData.password || userData.newPassword;
            if (isPasswordUpdate) {
                const isMatch = await bcrypt.compare(userData.password as string, user.password);
                if (!isMatch) {
                    return {
                        message: 'Current password is incorrect',
                        status: HttpStatusCode.BAD_REQUEST
                    };
                }

                const hashedPassword = await bcrypt.hash(userData.newPassword as string, 10);
                user.password = hashedPassword;
            }

            await user.save();
            return {
                message: isPasswordUpdate ? "Password updated": "Profile updated",
                status: HttpStatusCode.OK,
                user: user.toJSON()
            }
        } catch (error) {
            console.error(error);
            return {
                message: "Internal Server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }
}