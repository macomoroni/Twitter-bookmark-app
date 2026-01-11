import { Config, Bookmark, StorageData } from './types';

// Initialize storage and alarms
chrome.runtime.onInstalled.addListener(async () => {
  const defaultConfig: Config = {
    apiUrl: 'http://localhost:3001/api',
    token: null,
    email: null,
  };

  await chrome.storage.sync.set({
    config: defaultConfig,
    syncedCount: 0,
    autoSyncEnabled: true,
    syncIntervalMinutes: 30, // Default: every 30 minutes
    lastSyncTime: null,
  });

  // Setup periodic sync alarm
  chrome.alarms.create('autoSync', {
    periodInMinutes: 30,
  });

  console.log('Twitter Bookmarks Organizer installed! Auto-sync every 30 minutes.');
});

// Handle alarm for automatic background sync
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'autoSync') {
    const data = await chrome.storage.sync.get(['config', 'autoSyncEnabled']);

    if (data.autoSyncEnabled && data.config?.token) {
      console.log('Running automatic background sync...');
      await performBackgroundSync();
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_BOOKMARKS') {
    syncBookmarks(message.payload).then(sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.type === 'LOGIN') {
    handleLogin(message.payload).then(sendResponse);
    return true;
  }

  if (message.type === 'REGISTER') {
    handleRegister(message.payload).then(sendResponse);
    return true;
  }

  if (message.type === 'LOGOUT') {
    handleLogout().then(sendResponse);
    return true;
  }

  if (message.type === 'GET_CONFIG') {
    getConfig().then(sendResponse);
    return true;
  }

  if (message.type === 'UPDATE_SYNC_SETTINGS') {
    updateSyncSettings(message.payload).then(sendResponse);
    return true;
  }

  if (message.type === 'TRIGGER_MANUAL_SYNC') {
    performBackgroundSync().then(() => sendResponse({ success: true }));
    return true;
  }
});

async function getConfig(): Promise<Config> {
  const data = await chrome.storage.sync.get(['config']);
  return data.config;
}

async function handleLogin(payload: { email: string; password: string; apiUrl: string }) {
  try {
    const response = await fetch(`${payload.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Save config
    const config: Config = {
      apiUrl: payload.apiUrl,
      token: data.token,
      email: payload.email,
    };

    await chrome.storage.sync.set({ config });

    return { success: true, user: data.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function handleRegister(payload: { email: string; username: string; password: string; apiUrl: string }) {
  try {
    const response = await fetch(`${payload.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        username: payload.username,
        password: payload.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Save config
    const config: Config = {
      apiUrl: payload.apiUrl,
      token: data.token,
      email: payload.email,
    };

    await chrome.storage.sync.set({ config });

    return { success: true, user: data.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function handleLogout() {
  const config: Config = {
    apiUrl: 'http://localhost:3001/api',
    token: null,
    email: null,
  };

  await chrome.storage.sync.set({ config, syncedCount: 0 });

  // Clear auto-sync alarm
  chrome.alarms.clear('autoSync');

  return { success: true };
}

async function updateSyncSettings(payload: { enabled: boolean; intervalMinutes: number }) {
  await chrome.storage.sync.set({
    autoSyncEnabled: payload.enabled,
    syncIntervalMinutes: payload.intervalMinutes,
  });

  // Update alarm
  chrome.alarms.clear('autoSync');

  if (payload.enabled) {
    chrome.alarms.create('autoSync', {
      periodInMinutes: payload.intervalMinutes,
    });
  }

  return { success: true };
}

/**
 * Perform automatic background sync
 * Opens Twitter bookmarks page in background, scrapes, and syncs
 */
async function performBackgroundSync() {
  try {
    console.log('[Auto-Sync] Starting background sync...');

    // Create a hidden tab to load the bookmarks page
    const tab = await chrome.tabs.create({
      url: 'https://twitter.com/i/bookmarks',
      active: false, // Open in background
    });

    if (!tab.id) {
      throw new Error('Failed to create tab');
    }

    // Wait for tab to load
    await new Promise((resolve) => {
      const listener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve(null);
        }
      };
      chrome.tabs.onUpdated.addListener(listener);

      // Timeout after 30 seconds
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve(null);
      }, 30000);
    });

    // Give it a bit more time for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Send message to content script to scan and sync
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'SYNC_NOW' });

      if (response && response.success) {
        console.log('[Auto-Sync] Success:', response.results);

        // Update last sync time
        await chrome.storage.sync.set({
          lastSyncTime: new Date().toISOString(),
        });

        // Show notification
        if (response.results.created > 0) {
          chrome.notifications?.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Bookmarks Synced!',
            message: `Added ${response.results.created} new bookmarks`,
          });
        }
      }
    } catch (error) {
      console.error('[Auto-Sync] Content script error:', error);
    }

    // Close the tab
    await chrome.tabs.remove(tab.id);

    console.log('[Auto-Sync] Background sync completed');
  } catch (error) {
    console.error('[Auto-Sync] Failed:', error);
  }
}

async function syncBookmarks(bookmarks: Bookmark[]) {
  try {
    const data = await chrome.storage.sync.get(['config']);
    const config: Config = data.config;

    if (!config.token) {
      throw new Error('Not logged in');
    }

    const response = await fetch(`${config.apiUrl}/bookmarks/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify(bookmarks),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Sync failed');
    }

    // Update synced count
    const currentData = await chrome.storage.sync.get(['syncedCount']);
    const newCount = (currentData.syncedCount || 0) + result.results.created;
    await chrome.storage.sync.set({ syncedCount: newCount });

    return {
      success: true,
      results: result.results,
    };
  } catch (error: any) {
    console.error('Sync error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
