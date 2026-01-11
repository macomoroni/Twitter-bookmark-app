/**
 * Configuration for automatic categorization and tagging
 */

export interface AutoOrganizationConfig {
  // Enable/disable automatic categorization
  enableAutoCateg orization: boolean;

  // Enable/disable automatic tagging
  enableAutoTagging: boolean;

  // Use OpenAI for better categorization (requires API key)
  useOpenAI: boolean;

  // Minimum confidence threshold for auto-categorization (0-1)
  categoryConfidenceThreshold: number;

  // Maximum number of categories per bookmark
  maxCategoriesPerBookmark: number;

  // Maximum number of tags per bookmark
  maxTagsPerBookmark: number;

  // Include author in tags (creates author:username tags)
  includeAuthorTags: boolean;

  // Include hashtags as tags
  includeHashtagsAsTags: boolean;

  // Extract keywords as tags
  extractKeywordsAsTags: boolean;

  // Detect and tag programming languages
  detectProgrammingLanguages: boolean;

  // Detect and tag tech stack
  detectTechStack: boolean;
}

// Default configuration
export const defaultConfig: AutoOrganizationConfig = {
  enableAutoCategorization: true,
  enableAutoTagging: true,
  useOpenAI: false, // Set to true if you have OpenAI API key
  categoryConfidenceThreshold: 0.5,
  maxCategoriesPerBookmark: 3,
  maxTagsPerBookmark: 15,
  includeAuthorTags: true,
  includeHashtagsAsTags: true,
  extractKeywordsAsTags: true,
  detectProgrammingLanguages: true,
  detectTechStack: true,
};

// Get configuration from environment or use defaults
export function getAutoOrganizationConfig(): AutoOrganizationConfig {
  return {
    enableAutoCategorization:
      process.env.ENABLE_AUTO_CATEGORIZATION !== 'false',
    enableAutoTagging:
      process.env.ENABLE_AUTO_TAGGING !== 'false',
    useOpenAI:
      process.env.USE_OPENAI_CATEGORIZATION === 'true' && !!process.env.OPENAI_API_KEY,
    categoryConfidenceThreshold:
      parseFloat(process.env.CATEGORY_CONFIDENCE_THRESHOLD || '0.5'),
    maxCategoriesPerBookmark:
      parseInt(process.env.MAX_CATEGORIES_PER_BOOKMARK || '3'),
    maxTagsPerBookmark:
      parseInt(process.env.MAX_TAGS_PER_BOOKMARK || '15'),
    includeAuthorTags:
      process.env.INCLUDE_AUTHOR_TAGS !== 'false',
    includeHashtagsAsTags:
      process.env.INCLUDE_HASHTAGS_AS_TAGS !== 'false',
    extractKeywordsAsTags:
      process.env.EXTRACT_KEYWORDS_AS_TAGS !== 'false',
    detectProgrammingLanguages:
      process.env.DETECT_PROGRAMMING_LANGUAGES !== 'false',
    detectTechStack:
      process.env.DETECT_TECH_STACK !== 'false',
  };
}
