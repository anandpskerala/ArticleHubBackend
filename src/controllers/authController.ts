import { Request, Response } from "express";
import { CustomRequest } from "../types/CustomRequest";
import { IAuthService } from "../services/interfaces/IAuthService";

export class AuthController {
    constructor(private _authService: IAuthService) { }

    public register = async (req: Request, res: Response): Promise<void> => {
        const { firstName, lastName, email, phone, dob, password, interests } = req.body;
        const result = await this._authService.registerUser({
            firstName,
            lastName,
            email,
            phone,
            dob,
            password,
            interests
        }, res);
        res.status(result.status).json({ message: result.message, user: result.user });
    }

    public login = async (req: Request, res: Response): Promise<void> => {
        const { emailOrPhone, password } = req.body;
        const result = await this._authService.loginUser(emailOrPhone, password, res);
        res.status(result.status).json({ message: result.message, user: result.user });
    }

    public refreshToken = async (req: Request, res: Response): Promise<void> => {
        const token = req.cookies.refreshToken;
        const result = await this._authService.refreshToken(token, res);
        res.status(result.status).json({ message: result.message });
    }

    public verifyUser = async (req: CustomRequest, res: Response): Promise<void> => {
        const userId = req.userId as string;
        const result = await this._authService.verifyUser(userId);
        res.status(result.status).json({ message: result.message, user: result.user });
    }

    public logOut = async (req: Request, res: Response): Promise<void> => {
        const result = await this._authService.logOut(res);
        res.status(result.status).json({ message: result.message });
    }

    public changeUserDetails = async (req: Request, res: Response): Promise<void> => {
        const { firstName, lastName, email, phone, currentPassword, newPassword, interests } = req.body;
        const user = {
            firstName,
            lastName,
            phone,
            email,
            password: currentPassword,
            newPassword,
            interests
        }
        const result = await this._authService.changeUserdetails(user);
        res.status(result.status).json({ message: result.message, user: result.user });
    }
}