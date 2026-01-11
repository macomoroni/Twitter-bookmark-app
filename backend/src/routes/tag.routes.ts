import { Router } from 'express';
import { createTag, getTags, deleteTag } from '../controllers/tag.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createTag);
router.get('/', getTags);
router.delete('/:id', deleteTag);

export default router;
