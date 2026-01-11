import { prisma } from '../config/database';

export class AutoTaggingService {
  /**
   * Extract hashtags from tweet text
   */
  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.map(tag => tag.substring(1).toLowerCase());
  }

  /**
   * Extract @mentions from tweet text
   */
  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex) || [];
    return matches.map(mention => mention.substring(1).toLowerCase());
  }

  /**
   * Extract keywords using simple NLP techniques
   */
  private extractKeywords(text: string): string[] {
    // Remove URLs
    const cleanText = text.replace(/https?:\/\/\S+/g, '');

    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
      'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'just',
      'so', 'than', 'very', 'can', 'my', 'your', 'his', 'her', 'its', 'our',
      'their', 'me', 'him', 'them', 'us', 'as', 'if', 'out', 'all', 'there',
      'get', 'like', 'one', 'know', 'go', 'see', 'make', 'take', 'come', 'want',
    ]);

    // Extract words (2+ characters, alphanumeric)
    const words = cleanText
      .toLowerCase()
      .match(/\b[a-z0-9]{2,}\b/g) || [];

    // Filter stop words and get unique keywords
    const keywords = [...new Set(
      words.filter(word => !stopWords.has(word))
    )];

    // Sort by frequency and return top keywords
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return keywords
      .sort((a, b) => (wordFreq.get(b) || 0) - (wordFreq.get(a) || 0))
      .slice(0, 10); // Top 10 keywords
  }

  /**
   * Detect programming languages mentioned
   */
  private detectProgrammingLanguages(text: string): string[] {
    const languages = [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c++', 'csharp', 'c#',
      'ruby', 'go', 'golang', 'rust', 'swift', 'kotlin', 'php', 'scala',
      'r', 'matlab', 'sql', 'html', 'css', 'shell', 'bash',
    ];

    const textLower = text.toLowerCase();
    return languages.filter(lang => textLower.includes(lang));
  }

  /**
   * Detect tech frameworks and tools
   */
  private detectTechStack(text: string): string[] {
    const techStack = [
      'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt',
      'nodejs', 'express', 'fastify', 'nestjs', 'django', 'flask',
      'rails', 'laravel', 'spring', 'dotnet', '.net',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'vercel', 'netlify',
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
      'graphql', 'rest', 'api', 'webpack', 'vite', 'tailwind', 'bootstrap',
    ];

    const textLower = text.toLowerCase();
    return techStack.filter(tech => textLower.includes(tech));
  }

  /**
   * Automatically generate tags for a bookmark
   */
  async autoTagBookmark(userId: string, bookmarkId: string, text: string, authorUsername: string): Promise<string[]> {
    const allTags = new Set<string>();

    // Extract hashtags
    const hashtags = this.extractHashtags(text);
    hashtags.forEach(tag => allTags.add(tag));

    // Extract keywords
    const keywords = this.extractKeywords(text);
    keywords.slice(0, 5).forEach(keyword => allTags.add(keyword)); // Top 5 keywords

    // Detect programming languages
    const languages = this.detectProgrammingLanguages(text);
    languages.forEach(lang => allTags.add(lang));

    // Detect tech stack
    const techStack = this.detectTechStack(text);
    techStack.forEach(tech => allTags.add(tech));

    // Add author as a tag (useful for finding all tweets from a person)
    allTags.add(`author:${authorUsername.toLowerCase()}`);

    // Convert to array and limit to 15 tags
    const tagNames = Array.from(allTags).slice(0, 15);

    // Create tags and assign to bookmark
    const tagIds: string[] = [];

    for (const tagName of tagNames) {
      try {
        const tag = await prisma.tag.upsert({
          where: {
            userId_name: {
              userId,
              name: tagName,
            },
          },
          update: {},
          create: {
            userId,
            name: tagName,
          },
        });

        tagIds.push(tag.id);
      } catch (error) {
        console.error(`Failed to create tag ${tagName}:`, error);
      }
    }

    // Assign tags to bookmark
    if (tagIds.length > 0) {
      // Remove existing tags
      await prisma.bookmarkTag.deleteMany({
        where: { bookmarkId },
      });

      // Add new tags
      await prisma.bookmarkTag.createMany({
        data: tagIds.map(tagId => ({
          bookmarkId,
          tagId,
        })),
        skipDuplicates: true,
      });
    }

    return tagIds;
  }

  /**
   * Get suggested tags without saving
   */
  getSuggestedTags(text: string, authorUsername: string): string[] {
    const allTags = new Set<string>();

    // Extract hashtags
    const hashtags = this.extractHashtags(text);
    hashtags.forEach(tag => allTags.add(tag));

    // Extract keywords
    const keywords = this.extractKeywords(text);
    keywords.slice(0, 5).forEach(keyword => allTags.add(keyword));

    // Detect programming languages
    const languages = this.detectProgrammingLanguages(text);
    languages.forEach(lang => allTags.add(lang));

    // Detect tech stack
    const techStack = this.detectTechStack(text);
    techStack.forEach(tech => allTags.add(tech));

    // Add author tag
    allTags.add(`author:${authorUsername.toLowerCase()}`);

    return Array.from(allTags).slice(0, 15);
  }
}

export const autoTaggingService = new AutoTaggingService();
