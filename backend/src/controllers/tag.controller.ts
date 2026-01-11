import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

const createTagSchema = z.object({
  name: z.string().min(1).max(30),
});

export async function createTag(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { name } = createTagSchema.parse(req.body);

    // Check if tag already exists
    const existing = await prisma.tag.findUnique({
      where: {
        userId_name: {
          userId,
          name: name.toLowerCase(),
        },
      },
    });

    if (existing) {
      return res.status(200).json({
        message: 'Tag already exists',
        tag: existing,
      });
    }

    const tag = await prisma.tag.create({
      data: {
        userId,
        name: name.toLowerCase(),
      },
      include: {
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Tag created successfully',
      tag,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
}

export async function getTags(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
}

export async function deleteTag(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if tag exists and belongs to user
    const tag = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await prisma.tag.delete({
      where: { id },
    });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
}
