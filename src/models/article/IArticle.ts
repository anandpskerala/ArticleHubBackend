import { Types } from "mongoose";

export interface IArticle extends Document{
    id: string;
    title: string;
    content: string;
    image: string;
    imageId: string;
    category: string;
    tags: string[];
    authorId: Types.ObjectId;
    likes: string[];
    dislikes: string[];
    blockedBy: string[];
}