import { Router } from 'express';
import { initializeUserDefaults, getAutoOrganizationSuggestions } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/initialize-defaults', initializeUserDefaults);
router.get('/auto-suggestions', getAutoOrganizationSuggestions);

export default router;
