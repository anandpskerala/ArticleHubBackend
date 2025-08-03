import fs from "fs";
import { Model } from "mongoose";
import { IArticle } from "../models/article/IArticle";
import { ArticleModel } from "../models/article/model";
import { Request } from "express";
import { HttpStatusCode } from "../types/httpStatusCodes";
import cloudinary from "../utils/cloudinary";

export class ArticleService {
    private readonly model: Model<IArticle>;
    constructor() {
        this.model = ArticleModel;
    }

    public async createPost(req: Request) {
        try {
            const authorId = req.headers['x-user-id'] as string;
            const { title, content, category, tags } = req.body;
            let article: IArticle;
            if (req.file) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'nexevent/articles',
                });
                article = (await this.model.create({
                    title,
                    content,
                    image: uploadResult.secure_url,
                    imageId: uploadResult.public_id,
                    category,
                    tags: JSON.parse(tags),
                    authorId,
                })).toJSON() as IArticle;
            } else {
                article = (await this.model.create({
                    title,
                    content,
                    category,
                    tags: JSON.parse(tags),
                    authorId,
                })).toJSON() as IArticle;
            }

            return {
                message: "Article created",
                status: HttpStatusCode.CREATED,
                article
            }
        } catch (error) {
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        } finally {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
        }
    }

    public async editPost(req: Request) {
        try {
            const articleId = req.params.id;
            let { title, content, category, tags } = req.body;

            const existingArticle = await this.model.findById(articleId);
            if (!existingArticle) {
                return {
                    message: "Article not found",
                    status: HttpStatusCode.NOT_FOUND,
                };
            }

            let article: IArticle | null;
            if (req.file) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'nexevent/articles',
                });

                if (existingArticle.imageId) {
                    await cloudinary.uploader.destroy(existingArticle.imageId, {
                        type: "authenticated"
                    });
                }
                article = (await this.model.findByIdAndUpdate(articleId, {
                    $set: {
                        title,
                        content,
                        category,
                        tags: JSON.parse(tags),
                        image: uploadResult.secure_url
                    }
                }, { new: true }))?.toJSON() as IArticle | null;
            } else {
                article = (await this.model.findByIdAndUpdate(articleId, {
                    $set: {
                        title,
                        content,
                        category,
                        tags: JSON.parse(tags),
                    }
                }, { new: true }))?.toJSON() as IArticle | null;
            }

            return {
                message: "Article updated",
                status: HttpStatusCode.OK,
                article
            }
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        } finally {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
        }
    }

    public async getArticles(userId: string, page: number, limit: number, isCreator: boolean) {
        try {
            const filter = isCreator ? { authorId: userId } : {};
            const skip = (page - 1) * limit;

            const [docs, total] = await Promise.all([
                this.model
                    .find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("authorId"),
                this.model.countDocuments(filter)
            ]);

            const items = docs.map(doc => doc.toJSON());

            return { message: '', status: HttpStatusCode.OK, items, total, pages: Math.ceil(total / limit) };
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async deleteArticle(userId: string, articleId: string) {
        try {
            const exists = await this.model.findOne({ _id: articleId, authorId: userId });
            if (!exists) {
                return {
                    message: "This article doesn't exists",
                    status: HttpStatusCode.NOT_FOUND
                }
            }

            await cloudinary.uploader.destroy(exists.imageId, {
                type: "authenticated"
            });
            await this.model.deleteOne({ _id: articleId, authorId: userId });
            return {
                message: "Article deleted",
                status: HttpStatusCode.OK
            }
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async like(userId: string, articleId: string) {
        try {
            const exists = await this.model.findOne({ _id: articleId });
            if (!exists) {
                return {
                    message: "This article doesn't exists",
                    status: HttpStatusCode.NOT_FOUND
                }
            }
            await this.model.updateOne({ _id: articleId }, { $pull: { dislikes: userId } });
            await this.model.updateOne({ _id: articleId }, { $addToSet: { likes: userId } });
            return {
                message: "Article Liked",
                status: HttpStatusCode.OK
            }
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async unLike(userId: string, articleId: string) {
        try {
            const exists = await this.model.findOne({ _id: articleId });
            if (!exists) {
                return {
                    message: "This article doesn't exists",
                    status: HttpStatusCode.NOT_FOUND
                }
            }
            await this.model.updateOne({ _id: articleId }, { $pull: { likes: userId } });
            await this.model.updateOne({ _id: articleId }, { $addToSet: { dislikes: userId } });
            return {
                message: "Article Disliked",
                status: HttpStatusCode.OK
            }
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async block(userId: string, articleId: string) {
        try {
            const exists = await this.model.findOne({ _id: articleId });
            if (!exists) {
                return {
                    message: "This article doesn't exists",
                    status: HttpStatusCode.NOT_FOUND
                }
            }
            await this.model.updateOne({ _id: articleId }, { $addToSet: { blockedBy: userId } });
            return {
                message: "Article blocked",
                status: HttpStatusCode.OK
            }
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async unBlock(userId: string, articleId: string) {
        try {
            const exists = await this.model.findOne({ _id: articleId });
            if (!exists) {
                return {
                    message: "This article doesn't exists",
                    status: HttpStatusCode.NOT_FOUND
                }
            }
            await this.model.updateOne({ _id: articleId }, { $pull: { blockedBy: userId } });
            return {
                message: "Article unblocked",
                status: HttpStatusCode.OK
            }
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }
}