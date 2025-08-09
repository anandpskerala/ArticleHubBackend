import { IUser } from "../../models/user/IUser";
import { Response } from "express";
import { AuthReturn } from "../../types/AuthReturn";

export interface IAuthService {
    registerUser(user: Partial<IUser>, res: Response): Promise<AuthReturn>;
    loginUser(emailOrPhone: string, password: string, res: Response): Promise<AuthReturn>;
    refreshToken(token: string, res: Response): Promise<AuthReturn>;
    verifyUser(userId: string): Promise<AuthReturn>;
    logOut(res: Response): Promise<AuthReturn>;
    changeUserdetails(userData: Partial<IUser & { newPassword: string }>): Promise<AuthReturn>;
}