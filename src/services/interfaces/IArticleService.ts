import { Request } from "express";
import { ArticleReturn, ArticleReturnWithPagination } from "../../types/ArticleReturn";
import { CustomRequest } from "../../types/CustomRequest";

export interface IArticleService {
    createPost(req: CustomRequest): Promise<ArticleReturn>;
    editPost(req: Request): Promise<ArticleReturn>;
    getArticles(userId: string, page: number, limit: number, isCreator: boolean): Promise<ArticleReturnWithPagination>;
    deleteArticle(userId: string, articleId: string): Promise<ArticleReturn>;
    likeArticle(userId: string, articleId: string): Promise<ArticleReturn>;
    unLikeArticle(userId: string, articleId: string): Promise<ArticleReturn>;
    blockArticle(userId: string, articleId: string): Promise<ArticleReturn>;
    unBlockArticle(userId: string, articleId: string): Promise<ArticleReturn>;

} 