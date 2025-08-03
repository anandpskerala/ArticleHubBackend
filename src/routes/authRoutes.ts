import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { protectRoute } from '../middlewares/protectedRoutes';

const router: Router = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify', protectRoute, authController.verifyUser);
router.delete('/logout', authController.logOut);
router.put("/profile", protectRoute, authController.changeUserDetails);

export default router;