import { IArticle } from "../models/article/IArticle";
import { HttpStatusCode } from "./httpStatusCodes";

export interface ArticleReturn {
    message: string;
    status: HttpStatusCode;
    article?: IArticle;
}

export interface ArticleReturnWithPagination {
    message: string;
    status: HttpStatusCode;
    items?: IArticle[];
    total?: number;
    pages?: number;
}