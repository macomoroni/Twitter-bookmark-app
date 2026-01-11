export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  _count?: {
    bookmarks: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  _count?: {
    bookmarks: number;
  };
}

export interface Bookmark {
  id: string;
  tweetId: string;
  tweetUrl: string;
  text: string;
  authorName: string;
  authorUsername: string;
  authorProfileImage?: string;
  mediaUrls: string[];
  createdAt: string;
  addedAt: string;
  categories: {
    category: Category;
  }[];
  tags: {
    tag: Tag;
  }[];
}

export interface Stats {
  totalBookmarks: number;
  totalCategories: number;
  totalTags: number;
  recentBookmarks: number;
  topAuthors: {
    username: string;
    name: string;
    count: number;
  }[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
