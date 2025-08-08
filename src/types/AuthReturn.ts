import { IUser } from "../models/user/IUser";
import { HttpStatusCode } from "./httpStatusCodes";

export interface AuthReturn {
    message: string;
    status: HttpStatusCode;
    user?: IUser;
}