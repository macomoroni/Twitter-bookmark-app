import { Config, Bookmark, StorageData } from './types';

// Initialize storage
chrome.runtime.onInstalled.addListener(() => {
  const defaultConfig: Config = {
    apiUrl: 'http://localhost:3001/api',
    token: null,
    email: null,
  };

  chrome.storage.sync.set({
    config: defaultConfig,
    syncedCount: 0,
  });

  console.log('Twitter Bookmarks Organizer installed!');
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
  return { success: true };
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
