import { Request, Response } from "express";
import { ArticleService } from "../services/articleService";

export class ArticleController {
    constructor(private articleService: ArticleService) { }

    public createArticle = async (req: Request, res: Response): Promise<void> => {
        const result = await this.articleService.createPost(req);
        res.status(result.status).json({ message: result.message, article: result.article });
    }

    public editArticle = async (req: Request, res: Response): Promise<void> => {
        const result = await this.articleService.editPost(req);
        res.status(result.status).json({ message: result.message, article: result.article });
    }

    public getArticles = async (req: Request, res: Response): Promise<void> => {
        const userId = req.headers['x-user-id'] as string;
        const { page = 1, limit = 10, isCreator = 'false' } = req.query;
        const result = await this.articleService.getArticles(userId, Number(page), Number(limit), isCreator === 'true' ? true : false);
        res.status(result.status).json({
            message: result.message,
            total: result.total,
            page,
            pages: result.pages,
            articles: result.items
        });
    }

    public deleteArticle = async (req: Request, res: Response): Promise<void> => {
        const userId = req.headers['x-user-id'] as string;
        const articleId = req.params.id;
        const result = await this.articleService.deleteArticle(userId, articleId as string);
        res.status(result.status).json({message: result.message});
    }

    public likeArticle = async (req: Request, res: Response): Promise<void> => {
        const userId = req.headers['x-user-id'] as string;
        const articleId = req.params.id;
        const result = await this.articleService.like(userId, articleId as string);
        res.status(result.status).json({message: result.message});
    }

    public unLikeArticle = async (req: Request, res: Response): Promise<void> => {
        const userId = req.headers['x-user-id'] as string;
        const articleId = req.params.id;
        const result = await this.articleService.unLike(userId, articleId as string);
        res.status(result.status).json({message: result.message});   
    }

    public blockArticle = async (req: Request, res: Response): Promise<void> => {
        const userId = req.headers['x-user-id'] as string;
        const articleId = req.params.id;
        const result = await this.articleService.block(userId, articleId as string);
        res.status(result.status).json({message: result.message});   
    }

    public unBlockArticle = async (req: Request, res: Response): Promise<void> => {
        const userId = req.headers['x-user-id'] as string;
        const articleId = req.params.id;
        const result = await this.articleService.unBlock(userId, articleId as string);
        res.status(result.status).json({message: result.message});   
    }
}