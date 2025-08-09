import { Model } from "mongoose";
import { IArticle } from "../../models/article/IArticle";
import { BaseRepository } from "../base.repository";
import { IArticleRepository } from "../interfaces/IArticleRepository";
import { ArticleModel } from "../../models/article/model";

export class ArticleRepository extends BaseRepository<IArticle> implements IArticleRepository {
    constructor() {
        super(ArticleModel); 
    }

    async updateById(articleId: string, updateData: Partial<IArticle>): Promise<IArticle | undefined> {
        const doc = await this._model.findByIdAndUpdate(articleId, { $set: updateData }, { new: true });
        return doc?.toJSON() as IArticle;
    }

    async findWithPagination(filter: object, skip: number, limit: number): Promise<IArticle[]> {
        const doc = (await this._model
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("authorId")).map(doc => doc.toJSON() as IArticle);
        return doc;
    }
}