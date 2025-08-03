import mongoose, { Schema, Types } from "mongoose";
import { IArticle } from "./IArticle";

const ArticleSchema = new Schema<IArticle>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			default: "",
		},
		imageId: {
			type: String,
			default: "",
		},
		category: {
			type: String,
			required: true,
		},
		tags: [
			{
				type: String,
			},
		],
		authorId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		likes: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		dislikes: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		blockedBy: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{
		timestamps: true,
	}
);


ArticleSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: (_doc, ret: Partial<IArticle> & { _id: Types.ObjectId }) => {
		ret.id = ret._id.toString();
	}
});



export const ArticleModel = mongoose.model<IArticle>("Article", ArticleSchema);