import { Router } from 'express';
import authRoutes from './auth.routes';
import bookmarkRoutes from './bookmark.routes';
import categoryRoutes from './category.routes';
import tagRoutes from './tag.routes';
import searchRoutes from './search.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/search', searchRoutes);

export default router;
