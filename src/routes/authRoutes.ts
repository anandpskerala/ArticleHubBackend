import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/implementation/auth.service';
import { protectRoute } from '../middlewares/protectedRoutes';
import { UserRepository } from '../repositories/implementation/user.repository';

const router: Router = Router();

const authService = new AuthService(new UserRepository());
const authController = new AuthController(authService);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify', protectRoute, authController.verifyUser);
router.delete('/logout', authController.logOut);
router.put("/profile", protectRoute, authController.changeUserDetails);

export default router;