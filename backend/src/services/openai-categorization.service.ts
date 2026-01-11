/**
 * OpenAI-based Auto-Categorization Service (Optional)
 *
 * This service uses OpenAI's API to provide intelligent categorization.
 * Requires OPENAI_API_KEY environment variable to be set.
 *
 * To enable:
 * 1. Install openai package: npm install openai
 * 2. Set OPENAI_API_KEY in your .env file
 * 3. Uncomment the implementation below
 */

// Uncomment when you want to use OpenAI

// import OpenAI from 'openai';
// import { prisma } from '../config/database';

// const openai = process.env.OPENAI_API_KEY
//   ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
//   : null;

// export class OpenAICategorizationService {
//   /**
//    * Use OpenAI to intelligently categorize a bookmark
//    */
//   async categorizeWithAI(
//     userId: string,
//     bookmarkId: string,
//     text: string,
//     availableCategories: string[]
//   ): Promise<string[]> {
//     if (!openai) {
//       throw new Error('OpenAI API key not configured');
//     }

//     const prompt = `Analyze this tweet and suggest the most relevant categories from the list below.
// Return ONLY category names as a JSON array, nothing else.

// Tweet: "${text}"

// Available categories:
// ${availableCategories.join(', ')}

// Respond with a JSON array like: ["Category1", "Category2"]
// If none fit well, suggest 1-2 new category names that would be appropriate.`;

//     try {
//       const response = await openai.chat.completions.create({
//         model: 'gpt-3.5-turbo',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are a helpful assistant that categorizes tweets. Respond only with a JSON array of category names.',
//           },
//           {
//             role: 'user',
//             content: prompt,
//           },
//         ],
//         temperature: 0.3,
//         max_tokens: 100,
//       });

//       const content = response.choices[0]?.message?.content || '[]';
//       const suggestedCategories = JSON.parse(content) as string[];

//       // Create or find categories
//       const categoryIds: string[] = [];

//       for (const categoryName of suggestedCategories.slice(0, 3)) {
//         const category = await prisma.category.upsert({
//           where: {
//             userId_name: {
//               userId,
//               name: categoryName,
//             },
//           },
//           update: {},
//           create: {
//             userId,
//             name: categoryName,
//             color: this.generateColor(categoryName),
//           },
//         });

//         categoryIds.push(category.id);
//       }

//       // Assign categories to bookmark
//       if (categoryIds.length > 0) {
//         await prisma.bookmarkCategory.deleteMany({
//           where: { bookmarkId },
//         });

//         await prisma.bookmarkCategory.createMany({
//           data: categoryIds.map(categoryId => ({
//             bookmarkId,
//             categoryId,
//           })),
//         });
//       }

//       return categoryIds;
//     } catch (error) {
//       console.error('OpenAI categorization failed:', error);
//       throw error;
//     }
//   }

//   /**
//    * Generate a color based on category name (simple hash)
//    */
//   private generateColor(name: string): string {
//     const colors = [
//       '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#ef4444',
//       '#06b6d4', '#f59e0b', '#f97316', '#84cc16', '#6366f1',
//     ];

//     let hash = 0;
//     for (let i = 0; i < name.length; i++) {
//       hash = name.charCodeAt(i) + ((hash << 5) - hash);
//     }

//     return colors[Math.abs(hash) % colors.length];
//   }

//   /**
//    * Extract intelligent tags using OpenAI
//    */
//   async extractTagsWithAI(text: string): Promise<string[]> {
//     if (!openai) {
//       throw new Error('OpenAI API key not configured');
//     }

//     const prompt = `Extract 5-10 relevant tags/keywords from this tweet.
// Return ONLY a JSON array of lowercase tag names.

// Tweet: "${text}"

// Focus on:
// - Main topics
// - Technologies/tools mentioned
// - Key concepts
// - Industry/domain

// Respond with: ["tag1", "tag2", "tag3"]`;

//     try {
//       const response = await openai.chat.completions.create({
//         model: 'gpt-3.5-turbo',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are a helpful assistant that extracts relevant tags from tweets. Respond only with a JSON array.',
//           },
//           {
//             role: 'user',
//             content: prompt,
//           },
//         ],
//         temperature: 0.3,
//         max_tokens: 150,
//       });

//       const content = response.choices[0]?.message?.content || '[]';
//       const tags = JSON.parse(content) as string[];

//       return tags.slice(0, 10).map(tag => tag.toLowerCase());
//     } catch (error) {
//       console.error('OpenAI tag extraction failed:', error);
//       throw error;
//     }
//   }
// }

// export const openaiCategorizationService = new OpenAICategorizationService();

// Placeholder export for now
export const openaiCategorizationService = {
  enabled: false,
  message: 'Install openai package and set OPENAI_API_KEY to enable AI categorization',
};
