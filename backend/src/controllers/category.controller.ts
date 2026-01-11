import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
});

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const data = createCategorySchema.parse(req.body);

    // Check if category already exists
    const existing = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId,
          name: data.name,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name: data.name,
        color: data.color || '#3b82f6',
        icon: data.icon,
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
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

export async function getCategories(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
}

export async function getCategory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
}

export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const data = updateCategorySchema.parse(req.body);

    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if new name conflicts with existing category
    if (data.name && data.name !== category.name) {
      const existing = await prisma.category.findUnique({
        where: {
          userId_name: {
            userId,
            name: data.name,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    });

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Check if category exists and belongs to user
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}
