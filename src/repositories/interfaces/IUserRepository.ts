import { IUser } from "../../models/user/IUser";

export interface IUserRepository {
    createUser(user: Partial<IUser>): Promise<IUser>;
    findByEmailOrPhone(email: string, phone: string): Promise<IUser | undefined>;
    findById(id: string): Promise<IUser | undefined>;
    updateUser(filter: object, update: object): Promise<void>;
    findOne(filter: object): Promise<IUser | undefined>;
}