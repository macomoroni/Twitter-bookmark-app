export interface Config {
  apiUrl: string;
  token: string | null;
  email: string | null;
}

export interface Bookmark {
  tweetId: string;
  tweetUrl: string;
  text: string;
  authorName: string;
  authorUsername: string;
  authorProfileImage?: string;
  mediaUrls?: string[];
  createdAt?: string;
}

export interface StorageData {
  config: Config;
  syncedCount: number;
}

export interface MessageData {
  type: string;
  payload?: any;
}
