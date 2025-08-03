import mongoose from "mongoose";
import { IUser } from "./IUser";

const UserSchema = new mongoose.Schema<IUser>({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	phone: { type: String, required: true, unique: true },
	dob: { type: Date, required: true },
	password: { type: String, required: true },
	interests: { type: [String], default: [] },
}, { timestamps: true });

UserSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: (_, ret) => {
		ret.id = ret._id;
		delete ret._id;
	}
});

export default mongoose.model<IUser>('User', UserSchema);