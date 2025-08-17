import { FilterQuery } from "mongoose";
import { IArticle } from "../../models/article/IArticle";

export interface IArticleRepository {
    create(data: Partial<IArticle>): Promise<IArticle>;
    findById(id: string): Promise<IArticle | undefined>;
    updateOne(filter: object, update: object): Promise<void>;
    countDocuments(filter: object): Promise<number>;
    findOne(filter: object): Promise<IArticle | undefined>;
    deleteOne(filter: object): Promise<void>;
    updateById(articleId: string, updateData: Partial<IArticle>): Promise<IArticle | undefined>;
    findWithPagination(filter: object, skip: number, limit: number): Promise<IArticle[]>;
    findWithQuery(query: FilterQuery<IArticle>): Promise<IArticle | undefined>;
}