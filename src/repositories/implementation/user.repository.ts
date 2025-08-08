import { IUser } from "../../models/user/IUser";
import userModel from "../../models/user/model";
import { BaseRepository } from "../base.repository";
import { IUserRepository } from "../interfaces/IUserRepository";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    constructor() {
        super(userModel);
    }

    async createUser(user: Partial<IUser>): Promise<IUser> {
        return super.create(user);
    }

    async findByEmailOrPhone(email: string, phone: string): Promise<IUser | undefined> {
        return this.findOne({ $or: [{ email }, { phone }] });
    }

    async updateUser(filter: object, update: object): Promise<void> {
        return super.updateOne(filter, update);
    }
}