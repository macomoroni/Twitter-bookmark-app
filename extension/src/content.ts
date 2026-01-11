import { Bookmark } from './types';

console.log('Twitter Bookmarks Organizer: Content script loaded');

// Check if we're on the bookmarks page
function isBookmarksPage(): boolean {
  const path = window.location.pathname;
  return path.includes('/bookmarks') || path.includes('/i/bookmarks');
}

// Extract bookmark data from tweet element
function extractBookmarkFromElement(article: Element): Bookmark | null {
  try {
    // Find tweet link to get tweet ID
    const tweetLink = article.querySelector('a[href*="/status/"]') as HTMLAnchorElement;
    if (!tweetLink) return null;

    const tweetUrl = tweetLink.href;
    const tweetId = tweetUrl.match(/\/status\/(\d+)/)?.[1];
    if (!tweetId) return null;

    // Extract tweet text
    const tweetTextElement = article.querySelector('[data-testid="tweetText"]');
    const text = tweetTextElement?.textContent || '';

    // Extract author info
    const authorNameElement = article.querySelector('[data-testid="User-Name"] span');
    const authorName = authorNameElement?.textContent || '';

    const authorUsernameElement = article.querySelector('[href^="/"][role="link"]') as HTMLAnchorElement;
    const authorUsername = authorUsernameElement?.href.split('/').pop()?.replace('@', '') || '';

    // Extract author profile image
    const authorImageElement = article.querySelector('img[alt][src*="profile"]') as HTMLImageElement;
    const authorProfileImage = authorImageElement?.src;

    // Extract media URLs
    const mediaUrls: string[] = [];
    const imageElements = article.querySelectorAll('img[src*="media"]') as NodeListOf<HTMLImageElement>;
    imageElements.forEach(img => {
      if (img.src && !img.src.includes('profile')) {
        mediaUrls.push(img.src);
      }
    });

    // Extract timestamp
    const timeElement = article.querySelector('time') as HTMLTimeElement;
    const createdAt = timeElement?.dateTime;

    return {
      tweetId,
      tweetUrl,
      text,
      authorName,
      authorUsername,
      authorProfileImage,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      createdAt,
    };
  } catch (error) {
    console.error('Error extracting bookmark:', error);
    return null;
  }
}

// Scan page for bookmarks
function scanBookmarks(): Bookmark[] {
  if (!isBookmarksPage()) {
    console.log('Not on bookmarks page');
    return [];
  }

  const bookmarks: Bookmark[] = [];
  const articles = document.querySelectorAll('article[data-testid="tweet"]');

  console.log(`Found ${articles.length} tweets on page`);

  articles.forEach(article => {
    const bookmark = extractBookmarkFromElement(article);
    if (bookmark) {
      bookmarks.push(bookmark);
    }
  });

  return bookmarks;
}

// Send bookmarks to background script for syncing
async function syncBookmarks() {
  const bookmarks = scanBookmarks();

  if (bookmarks.length === 0) {
    console.log('No bookmarks found to sync');
    return { success: false, error: 'No bookmarks found on this page' };
  }

  console.log(`Syncing ${bookmarks.length} bookmarks...`);

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: 'SYNC_BOOKMARKS',
        payload: bookmarks,
      },
      (response) => {
        if (response.success) {
          console.log('Sync successful:', response.results);
        } else {
          console.error('Sync failed:', response.error);
        }
        resolve(response);
      }
    );
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_PAGE') {
    const bookmarks = scanBookmarks();
    sendResponse({ bookmarks, count: bookmarks.length });
  }

  if (message.type === 'SYNC_NOW') {
    syncBookmarks().then(sendResponse);
    return true; // Keep channel open
  }
});

// Auto-sync when scrolling (detect new bookmarks loaded)
let lastSyncedCount = 0;
let syncTimeout: NodeJS.Timeout;

function autoSync() {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    const bookmarks = scanBookmarks();

    if (bookmarks.length > lastSyncedCount) {
      console.log(`Detected ${bookmarks.length - lastSyncedCount} new bookmarks`);
      syncBookmarks();
      lastSyncedCount = bookmarks.length;
    }
  }, 2000); // Wait 2 seconds after scrolling stops
}

// Only auto-sync on bookmarks page
if (isBookmarksPage()) {
  console.log('Bookmarks page detected - enabling auto-sync');

  // Initial scan
  setTimeout(() => {
    const bookmarks = scanBookmarks();
    lastSyncedCount = bookmarks.length;
  }, 3000);

  // Listen for scroll events
  window.addEventListener('scroll', autoSync);

  // Also listen for DOM changes (infinite scroll)
  const observer = new MutationObserver(autoSync);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

console.log('Twitter Bookmarks Organizer: Ready!');
