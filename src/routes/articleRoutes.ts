import { Router } from "express";
import { ArticleService } from "../services/implementation/article.service";
import { ArticleController } from "../controllers/articleController";
import { protectRoute } from "../middlewares/protectedRoutes";
import { upload } from "../middlewares/multer";
import { ArticleRepository } from "../repositories/implementation/article.repository";

const router: Router = Router();

const articleService = new ArticleService(new ArticleRepository());
const articleController = new ArticleController(articleService);

router.post("/article", protectRoute, upload.single('image'), articleController.createArticle);
router.patch("/article/:id", protectRoute, upload.single('image'), articleController.editArticle);
router.delete("/article/:id", protectRoute, articleController.deleteArticle);
router.get("/articles", protectRoute, articleController.getArticles);
router.patch("/like/:id", protectRoute, articleController.likeArticle);
router.delete("/like/:id", protectRoute, articleController.unLikeArticle);
router.patch("/block/:id", protectRoute, articleController.blockArticle);
router.delete("/block/:id", protectRoute, articleController.unBlockArticle);

export default router;