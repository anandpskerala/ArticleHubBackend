import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { IUser } from "../../models/user/IUser";
import { IUserRepository } from "../../repositories/interfaces/IUserRepository";
import { HttpStatusCode } from "../../types/httpStatusCodes";
import { config } from "../../config";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken";
import { IAuthService } from "../interfaces/IAuthService";
import { AuthReturn } from "../../types/AuthReturn";

export class AuthService implements IAuthService {
    constructor(private readonly _userRepository: IUserRepository) {}

    public async registerUser(user: Partial<IUser>, res: Response): Promise<AuthReturn> {
        const existingUser = await this._userRepository.findByEmailOrPhone(user.email!, user.phone!);
        if (existingUser) {
            return { message: "User already exists", status: HttpStatusCode.BAD_REQUEST };
        }

        const hashedPassword = await bcrypt.hash(user.password as string, 10);
        const newUser = await this._userRepository.createUser({ ...user, password: hashedPassword });

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

        return { message: "Signup successful", status: HttpStatusCode.OK, user: newUser };
    }

    public async loginUser(emailOrPhone: string, password: string, res: Response): Promise<AuthReturn> {
        const user = await this._userRepository.findByEmailOrPhone(emailOrPhone, emailOrPhone);
        if (!user) {
            return { message: "Invalid credentials", status: HttpStatusCode.FORBIDDEN };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { message: "Invalid credentials", status: HttpStatusCode.FORBIDDEN };
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

        return { message: "Login successful", status: HttpStatusCode.OK, user };
    }

    public async refreshToken(token: string, res: Response): Promise<AuthReturn> {
        if (!token) {
            return { message: "Refresh token not found", status: HttpStatusCode.UNAUTHORIZED };
        }

        const decoded = jwt.verify(token, config.jwt) as { userId: string };
        const user = await this._userRepository.findById(decoded.userId);

        if (!user) {
            return { message: "User not found", status: HttpStatusCode.NOT_FOUND };
        }

        const accessToken = await generateAccessToken(user.id, user.email);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: config.env === "production",
            sameSite: 'none',
            maxAge: 15 * 60 * 1000
        });

        return { message: "Token refreshed", status: HttpStatusCode.OK, user };
    }

    public async verifyUser(userId: string): Promise<AuthReturn> {
        if (!userId) {
            return { message: "Invalid user Id", status: HttpStatusCode.BAD_REQUEST };
        }

        const user = await this._userRepository.findById(userId);
        if (!user) {
            return { message: "User not found", status: HttpStatusCode.NOT_FOUND };
        }

        return { message: "", status: HttpStatusCode.OK, user };
    }

    public async logOut(res: Response): Promise<AuthReturn> {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return { message: "Logout successful", status: HttpStatusCode.OK };
    }

    public async changeUserdetails(userData: Partial<IUser & { newPassword: string }>): Promise<AuthReturn> {
        const user = await this._userRepository.findOne({ email: userData.email });
        if (!user) {
            return { message: "User not found", status: HttpStatusCode.NOT_FOUND };
        }

        user.firstName = userData.firstName!;
        user.lastName = userData.lastName!;
        user.phone = userData.phone!;
        user.interests = userData.interests!;

        const isPasswordUpdate = userData.password || userData.newPassword;
        if (isPasswordUpdate) {
            const isMatch = await bcrypt.compare(userData.password as string, user.password);
            if (!isMatch) {
                return { message: "Current password is incorrect", status: HttpStatusCode.BAD_REQUEST };
            }
            user.password = await bcrypt.hash(userData.newPassword as string, 10);
        }

        await this._userRepository.updateUser({ email: userData.email }, user);
        return { message: isPasswordUpdate ? "Password updated" : "Profile updated", status: HttpStatusCode.OK, user };
    }
}