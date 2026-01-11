import { Router } from 'express';
import { searchBookmarks, getStats } from '../controllers/search.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', searchBookmarks);
router.get('/stats', getStats);

export default router;
