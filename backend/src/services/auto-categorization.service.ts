import { prisma } from '../config/database';

interface CategoryRule {
  name: string;
  keywords: string[];
  color: string;
  icon?: string;
}

// Predefined category rules - expand this based on your needs
const CATEGORY_RULES: CategoryRule[] = [
  {
    name: 'Tech & Programming',
    keywords: ['javascript', 'python', 'code', 'programming', 'developer', 'api', 'software', 'react', 'nodejs', 'typescript', 'css', 'html', 'github', 'git', 'docker', 'aws', 'cloud', 'database', 'sql', 'ai', 'ml', 'machine learning', 'tutorial', 'dev'],
    color: '#3b82f6',
    icon: '💻',
  },
  {
    name: 'AI & Machine Learning',
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'gpt', 'chatgpt', 'openai', 'llm', 'model', 'training', 'dataset', 'tensorflow', 'pytorch', 'nlp'],
    color: '#8b5cf6',
    icon: '🤖',
  },
  {
    name: 'Design & UI/UX',
    keywords: ['design', 'ui', 'ux', 'figma', 'sketch', 'adobe', 'photoshop', 'interface', 'user experience', 'typography', 'color', 'layout', 'wireframe', 'prototype'],
    color: '#ec4899',
    icon: '🎨',
  },
  {
    name: 'Business & Startups',
    keywords: ['startup', 'entrepreneur', 'business', 'saas', 'revenue', 'marketing', 'sales', 'growth', 'funding', 'investor', 'vc', 'product', 'strategy', 'founder', 'ceo'],
    color: '#10b981',
    icon: '💼',
  },
  {
    name: 'News & Politics',
    keywords: ['news', 'politics', 'election', 'government', 'policy', 'president', 'congress', 'senate', 'breaking', 'update', 'report', 'crisis'],
    color: '#ef4444',
    icon: '📰',
  },
  {
    name: 'Science',
    keywords: ['science', 'research', 'study', 'paper', 'scientist', 'experiment', 'data', 'biology', 'physics', 'chemistry', 'astronomy', 'climate', 'nature'],
    color: '#06b6d4',
    icon: '🔬',
  },
  {
    name: 'Crypto & Web3',
    keywords: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'web3', 'nft', 'defi', 'token', 'wallet', 'dao', 'smart contract', 'metaverse'],
    color: '#f59e0b',
    icon: '₿',
  },
  {
    name: 'Entertainment',
    keywords: ['movie', 'film', 'tv show', 'series', 'music', 'game', 'gaming', 'entertainment', 'netflix', 'spotify', 'xbox', 'playstation', 'streamer'],
    color: '#f97316',
    icon: '🎬',
  },
  {
    name: 'Health & Fitness',
    keywords: ['health', 'fitness', 'workout', 'exercise', 'gym', 'nutrition', 'diet', 'wellness', 'medical', 'doctor', 'medicine', 'yoga', 'running'],
    color: '#84cc16',
    icon: '💪',
  },
  {
    name: 'Education & Learning',
    keywords: ['education', 'learning', 'course', 'tutorial', 'teach', 'student', 'university', 'college', 'school', 'book', 'read', 'study'],
    color: '#6366f1',
    icon: '📚',
  },
  {
    name: 'Inspiration & Quotes',
    keywords: ['inspiration', 'motivational', 'quote', 'wisdom', 'advice', 'life lesson', 'mindset', 'success', 'productivity'],
    color: '#a855f7',
    icon: '✨',
  },
  {
    name: 'Threads & Commentary',
    keywords: ['thread', '1/', '🧵', 'here\'s why', 'let me explain', 'breakdown', 'analysis'],
    color: '#64748b',
    icon: '🧵',
  },
];

export class AutoCategorizationService {
  /**
   * Initialize default categories for a user
   */
  async initializeDefaultCategories(userId: string): Promise<void> {
    for (const rule of CATEGORY_RULES) {
      try {
        await prisma.category.upsert({
          where: {
            userId_name: {
              userId,
              name: rule.name,
            },
          },
          update: {},
          create: {
            userId,
            name: rule.name,
            color: rule.color,
            icon: rule.icon,
          },
        });
      } catch (error) {
        console.error(`Failed to create category ${rule.name}:`, error);
      }
    }
  }

  /**
   * Automatically categorize a bookmark based on its content
   */
  async categorizeBo okmark(userId: string, bookmarkId: string, text: string): Promise<string[]> {
    const textLower = text.toLowerCase();
    const matchedCategories: string[] = [];

    // Find all matching categories
    for (const rule of CATEGORY_RULES) {
      const hasMatch = rule.keywords.some(keyword =>
        textLower.includes(keyword.toLowerCase())
      );

      if (hasMatch) {
        // Get or create category
        const category = await prisma.category.upsert({
          where: {
            userId_name: {
              userId,
              name: rule.name,
            },
          },
          update: {},
          create: {
            userId,
            name: rule.name,
            color: rule.color,
            icon: rule.icon,
          },
        });

        matchedCategories.push(category.id);
      }
    }

    // Assign categories to bookmark
    if (matchedCategories.length > 0) {
      // Remove existing categories
      await prisma.bookmarkCategory.deleteMany({
        where: { bookmarkId },
      });

      // Add new categories
      await prisma.bookmarkCategory.createMany({
        data: matchedCategories.map(categoryId => ({
          bookmarkId,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    return matchedCategories;
  }

  /**
   * Get suggested categories based on text (without saving)
   */
  getSuggestedCategories(text: string): string[] {
    const textLower = text.toLowerCase();
    const suggestions: string[] = [];

    for (const rule of CATEGORY_RULES) {
      const hasMatch = rule.keywords.some(keyword =>
        textLower.includes(keyword.toLowerCase())
      );

      if (hasMatch) {
        suggestions.push(rule.name);
      }
    }

    return suggestions;
  }

  /**
   * Add custom category rule (for learning from user behavior)
   */
  async addCustomRule(rule: CategoryRule): Promise<void> {
    // This could be extended to save custom rules to database
    CATEGORY_RULES.push(rule);
  }
}

export const autoCategorizationService = new AutoCategorizationService();
