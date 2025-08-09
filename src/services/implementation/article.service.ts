import fs from "fs";
import { Model, Types } from "mongoose";
import { IArticle } from "../../models/article/IArticle";
import { ArticleModel } from "../../models/article/model";
import { Request } from "express";
import { HttpStatusCode } from "../../types/httpStatusCodes";
import cloudinary from "../../utils/cloudinary";
import { CustomRequest } from "../../types/CustomRequest";
import { IArticleRepository } from "../../repositories/interfaces/IArticleRepository";
import { ArticleReturn, ArticleReturnWithPagination } from "../../types/ArticleReturn";
import { IArticleService } from "../interfaces/IArticleService";

export class ArticleService implements IArticleService {
    constructor(private readonly _repository: IArticleRepository) {
    }

    public async createPost(req: CustomRequest): Promise<ArticleReturn> {
        try {
            const authorId = req.userId as string;
            const { title, content, category, tags } = req.body;
            let imageUrl: string | undefined;
            let imageId: string | undefined;

            if (req.file) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: "nexevent/articles",
                });
                imageUrl = uploadResult.secure_url;
                imageId = uploadResult.public_id;
            }

            const article = await this._repository.create({
                title,
                content,
                image: imageUrl as string,
                imageId: imageId as string,
                category,
                tags: JSON.parse(tags),
                authorId: new Types.ObjectId(authorId),
            });
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

    public async editPost(req: Request): Promise<ArticleReturn> {
        try {
            const articleId = req.params.id;
            let { title, content, category, tags } = req.body;

            const existingArticle = await this._repository.findById(articleId as string);
            if (!existingArticle) {
                return {
                    message: "Article not found",
                    status: HttpStatusCode.NOT_FOUND,
                };
            }

            let updateData: Partial<IArticle> = { title, content, category, tags: JSON.parse(tags) };
            if (req.file) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: "nexevent/articles",
                });

                if (existingArticle.imageId) {
                    await cloudinary.uploader.destroy(existingArticle.imageId, { type: "authenticated" });
                }

                updateData.image = uploadResult.secure_url;
                updateData.imageId = uploadResult.public_id;
            }

            const updatedArticle = await this._repository.updateById(articleId as string, updateData);

            return {
                message: "Article updated",
                status: HttpStatusCode.OK,
                article: updatedArticle as IArticle
            };
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

    public async getArticles(userId: string, page: number, limit: number, isCreator: boolean): Promise<ArticleReturnWithPagination> {
        try {
            const filter = isCreator ? { authorId: userId } : {};
            const skip = (page - 1) * limit;

            const [docs, total] = await Promise.all([
                this._repository.findWithPagination(filter, skip, limit),
                this._repository.countDocuments(filter)
            ]);

            return { message: "", status: HttpStatusCode.OK, items: docs, total, pages: Math.ceil(total / limit) };
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async deleteArticle(userId: string, articleId: string): Promise<ArticleReturn> {
        try {
            const exists = await this._repository.findOne({ _id: articleId, authorId: userId });
            if (!exists) {
                return { message: "This article doesn't exist", status: HttpStatusCode.NOT_FOUND };
            }

            if (exists.imageId) {
                await cloudinary.uploader.destroy(exists.imageId, { type: "authenticated" });
            }

            await this._repository.deleteOne({ _id: articleId, authorId: userId });
            return { message: "Article deleted", status: HttpStatusCode.OK };
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async like(userId: string, articleId: string): Promise<ArticleReturn> {
        try {
            const exists = await this._repository.findById(articleId);
            if (!exists) {
                return { message: "This article doesn't exist", status: HttpStatusCode.NOT_FOUND };
            }
            await this._repository.updateOne({ _id: articleId }, { $pull: { dislikes: userId } });
            await this._repository.updateOne({ _id: articleId }, { $addToSet: { likes: userId } });
            return { message: "Article Liked", status: HttpStatusCode.OK };
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async unLike(userId: string, articleId: string): Promise<ArticleReturn> {
        try {
            const exists = await this._repository.findById(articleId);
            if (!exists) {
                return { message: "This article doesn't exist", status: HttpStatusCode.NOT_FOUND };
            }
            await this._repository.updateOne({ _id: articleId }, { $pull: { likes: userId } });
            await this._repository.updateOne({ _id: articleId }, { $addToSet: { dislikes: userId } });
            return { message: "Article Disliked", status: HttpStatusCode.OK };
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async block(userId: string, articleId: string): Promise<ArticleReturn> {
        try {
            const exists = await this._repository.findById(articleId);
            if (!exists) {
                return { message: "This article doesn't exist", status: HttpStatusCode.NOT_FOUND };
            }
            await this._repository.updateOne({ _id: articleId }, { $addToSet: { blockedBy: userId } });
            return { message: "Article blocked", status: HttpStatusCode.OK };
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }

    public async unBlock(userId: string, articleId: string): Promise<ArticleReturn> {
        try {
            const exists = await this._repository.findById(articleId);
            if (!exists) {
                return { message: "This article doesn't exist", status: HttpStatusCode.NOT_FOUND };
            }
            await this._repository.updateOne({ _id: articleId }, { $pull: { blockedBy: userId } });
            return { message: "Article unblocked", status: HttpStatusCode.OK };
        } catch (error) {
            console.log(error);
            return {
                message: "Internal server error",
                status: HttpStatusCode.INTERNAL_SERVER_ERROR
            }
        }
    }
}