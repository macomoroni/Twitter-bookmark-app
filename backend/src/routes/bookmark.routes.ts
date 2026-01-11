import { Router } from 'express';
import {
  createBookmark,
  getBookmarks,
  getBookmark,
  updateBookmark,
  deleteBookmark,
  bulkCreateBookmarks,
} from '../controllers/bookmark.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createBookmark);
router.post('/bulk', bulkCreateBookmarks);
router.get('/', getBookmarks);
router.get('/:id', getBookmark);
router.patch('/:id', updateBookmark);
router.delete('/:id', deleteBookmark);

export default router;
