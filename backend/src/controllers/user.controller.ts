import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { autoCategorizationService } from '../services/auto-categorization.service';

export async function initializeUserDefaults(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    // Initialize default categories
    await autoCategorizationService.initializeDefaultCategories(userId);

    res.json({
      message: 'Default categories initialized successfully',
    });
  } catch (error) {
    console.error('Initialize defaults error:', error);
    res.status(500).json({ error: 'Failed to initialize defaults' });
  }
}

export async function getAutoOrganizationSuggestions(req: AuthRequest, res: Response) {
  try {
    const { text, authorUsername } = req.query;

    if (!text || !authorUsername) {
      return res.status(400).json({ error: 'text and authorUsername are required' });
    }

    const categories = autoCategorizationService.getSuggestedCategories(text as string);
    const { autoTaggingService } = await import('../services/auto-tagging.service');
    const tags = autoTaggingService.getSuggestedTags(text as string, authorUsername as string);

    res.json({
      suggestions: {
        categories,
        tags,
      },
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
}
