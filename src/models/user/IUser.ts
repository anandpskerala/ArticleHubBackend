import { Document } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: Date;
    password: string;
    interests: string[];
    createdAt: Date;
    updatedAt: Date;
}