import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export async function searchBookmarks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      q, // search query
      categoryId,
      tagId,
      authorUsername,
      startDate,
      endDate,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      userId,
    };

    // Text search
    if (q) {
      where.OR = [
        { text: { contains: q as string, mode: 'insensitive' } },
        { authorName: { contains: q as string, mode: 'insensitive' } },
        { authorUsername: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    // Filter by category
    if (categoryId) {
      where.categories = {
        some: {
          categoryId: categoryId as string,
        },
      };
    }

    // Filter by tag
    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId as string,
        },
      };
    }

    // Filter by author
    if (authorUsername) {
      where.authorUsername = authorUsername as string;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'createdAt' || sortBy === 'addedAt' || sortBy === 'updatedAt') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Execute query
    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.bookmark.count({ where }),
    ]);

    res.json({
      bookmarks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Search bookmarks error:', error);
    res.status(500).json({ error: 'Failed to search bookmarks' });
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const [totalBookmarks, totalCategories, totalTags, recentBookmarks] = await Promise.all([
      prisma.bookmark.count({ where: { userId } }),
      prisma.category.count({ where: { userId } }),
      prisma.tag.count({ where: { userId } }),
      prisma.bookmark.count({
        where: {
          userId,
          addedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Get top authors
    const authorStats = await prisma.bookmark.groupBy({
      by: ['authorUsername', 'authorName'],
      where: { userId },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    res.json({
      stats: {
        totalBookmarks,
        totalCategories,
        totalTags,
        recentBookmarks,
        topAuthors: authorStats.map(stat => ({
          username: stat.authorUsername,
          name: stat.authorName,
          count: stat._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
}
