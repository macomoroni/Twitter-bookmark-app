import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

const createBookmarkSchema = z.object({
  tweetId: z.string(),
  tweetUrl: z.string().url(),
  text: z.string(),
  authorName: z.string(),
  authorUsername: z.string(),
  authorProfileImage: z.string().url().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  createdAt: z.string().datetime().optional(),
});

const updateBookmarkSchema = z.object({
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
});

export async function createBookmark(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const data = createBookmarkSchema.parse(req.body);

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_tweetId: {
          userId,
          tweetId: data.tweetId,
        },
      },
    });

    if (existingBookmark) {
      return res.status(200).json({
        message: 'Bookmark already exists',
        bookmark: existingBookmark
      });
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        tweetId: data.tweetId,
        tweetUrl: data.tweetUrl,
        text: data.text,
        authorName: data.authorName,
        authorUsername: data.authorUsername,
        authorProfileImage: data.authorProfileImage,
        mediaUrls: data.mediaUrls || [],
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      },
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
    });

    res.status(201).json({
      message: 'Bookmark created successfully',
      bookmark,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create bookmark error:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
}

export async function getBookmarks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bookmark.count({ where: { userId } }),
    ]);

    res.json({
      bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
}

export async function getBookmark(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId },
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
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ bookmark });
  } catch (error) {
    console.error('Get bookmark error:', error);
    res.status(500).json({ error: 'Failed to get bookmark' });
  }
}

export async function updateBookmark(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { categoryIds, tagIds } = updateBookmarkSchema.parse(req.body);

    // Check if bookmark exists and belongs to user
    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId },
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    // Update categories if provided
    if (categoryIds !== undefined) {
      // Delete existing categories
      await prisma.bookmarkCategory.deleteMany({
        where: { bookmarkId: id },
      });

      // Create new categories
      if (categoryIds.length > 0) {
        await prisma.bookmarkCategory.createMany({
          data: categoryIds.map(categoryId => ({
            bookmarkId: id,
            categoryId,
          })),
        });
      }
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      // Delete existing tags
      await prisma.bookmarkTag.deleteMany({
        where: { bookmarkId: id },
      });

      // Create new tags
      if (tagIds.length > 0) {
        await prisma.bookmarkTag.createMany({
          data: tagIds.map(tagId => ({
            bookmarkId: id,
            tagId,
          })),
        });
      }
    }

    // Get updated bookmark
    const updatedBookmark = await prisma.bookmark.findUnique({
      where: { id },
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
    });

    res.json({
      message: 'Bookmark updated successfully',
      bookmark: updatedBookmark,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update bookmark error:', error);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
}

export async function deleteBookmark(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if bookmark exists and belongs to user
    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId },
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    await prisma.bookmark.delete({
      where: { id },
    });

    res.json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
}

export async function bulkCreateBookmarks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const bookmarksData = z.array(createBookmarkSchema).parse(req.body);

    const results = {
      created: 0,
      skipped: 0,
      failed: 0,
    };

    for (const data of bookmarksData) {
      try {
        // Check if bookmark already exists
        const exists = await prisma.bookmark.findUnique({
          where: {
            userId_tweetId: {
              userId,
              tweetId: data.tweetId,
            },
          },
        });

        if (exists) {
          results.skipped++;
          continue;
        }

        // Create bookmark
        await prisma.bookmark.create({
          data: {
            userId,
            tweetId: data.tweetId,
            tweetUrl: data.tweetUrl,
            text: data.text,
            authorName: data.authorName,
            authorUsername: data.authorUsername,
            authorProfileImage: data.authorProfileImage,
            mediaUrls: data.mediaUrls || [],
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          },
        });

        results.created++;
      } catch (error) {
        console.error('Failed to create bookmark:', error);
        results.failed++;
      }
    }

    res.json({
      message: 'Bulk bookmark creation completed',
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Bulk create bookmarks error:', error);
    res.status(500).json({ error: 'Failed to bulk create bookmarks' });
  }
}
