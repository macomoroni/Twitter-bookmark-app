// Get DOM elements
const loginSection = document.getElementById('loginSection')!;
const loggedInSection = document.getElementById('loggedInSection')!;
const messageDiv = document.getElementById('message')!;

const apiUrlInput = document.getElementById('apiUrl') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;

const loginBtn = document.getElementById('loginBtn')!;
const registerBtn = document.getElementById('registerBtn')!;
const syncBtn = document.getElementById('syncBtn')!;
const logoutBtn = document.getElementById('logoutBtn')!;

const statusText = document.getElementById('statusText')!;
const userEmail = document.getElementById('userEmail')!;
const syncedCount = document.getElementById('syncedCount')!;
const pageCount = document.getElementById('pageCount')!;
const autoSyncToggle = document.getElementById('autoSyncToggle') as HTMLInputElement;
const autoSyncStatus = document.getElementById('autoSyncStatus')!;
const syncInterval = document.getElementById('syncInterval') as HTMLSelectElement;
const lastSyncTime = document.getElementById('lastSyncTime')!;

// Show message
function showMessage(text: string, type: 'success' | 'error') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  setTimeout(() => {
    messageDiv.className = 'message hidden';
  }, 3000);
}

// Load config and update UI
async function loadConfig() {
  const data = await chrome.storage.sync.get([
    'config',
    'syncedCount',
    'autoSyncEnabled',
    'syncIntervalMinutes',
    'lastSyncTime',
  ]);
  const config = data.config;

  if (config.token) {
    // User is logged in
    loginSection.classList.add('hidden');
    loggedInSection.classList.remove('hidden');
    userEmail.textContent = config.email || '-';
    syncedCount.textContent = data.syncedCount || '0';

    // Update API URL in input
    apiUrlInput.value = config.apiUrl;

    // Update auto-sync settings
    const autoSyncEnabled = data.autoSyncEnabled !== false; // Default true
    autoSyncToggle.checked = autoSyncEnabled;
    autoSyncStatus.textContent = autoSyncEnabled ? 'Enabled' : 'Disabled';

    const intervalMinutes = data.syncIntervalMinutes || 30;
    syncInterval.value = intervalMinutes.toString();

    // Update last sync time
    if (data.lastSyncTime) {
      const lastSync = new Date(data.lastSyncTime);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / 60000);

      if (diffMinutes < 1) {
        lastSyncTime.textContent = 'Just now';
      } else if (diffMinutes < 60) {
        lastSyncTime.textContent = `${diffMinutes}m ago`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        lastSyncTime.textContent = `${diffHours}h ago`;
      }
    } else {
      lastSyncTime.textContent = 'Never';
    }

    // Get current page bookmark count
    getCurrentPageBookmarkCount();
  } else {
    // User is logged out
    loginSection.classList.remove('hidden');
    loggedInSection.classList.add('hidden');
  }
}

// Get bookmark count on current page
async function getCurrentPageBookmarkCount() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) return;

  chrome.tabs.sendMessage(
    tab.id,
    { type: 'SCAN_PAGE' },
    (response) => {
      if (response && response.count !== undefined) {
        pageCount.textContent = response.count.toString();
      }
    }
  );
}

// Login handler
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const apiUrl = apiUrlInput.value.trim();

  if (!email || !password) {
    showMessage('Please enter email and password', 'error');
    return;
  }

  loginBtn.textContent = 'Logging in...';
  loginBtn.setAttribute('disabled', 'true');

  const response = await chrome.runtime.sendMessage({
    type: 'LOGIN',
    payload: { email, password, apiUrl },
  });

  loginBtn.textContent = 'Login';
  loginBtn.removeAttribute('disabled');

  if (response.success) {
    showMessage('Login successful!', 'success');
    passwordInput.value = '';
    loadConfig();
  } else {
    showMessage(response.error || 'Login failed', 'error');
  }
});

// Register handler
registerBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const apiUrl = apiUrlInput.value.trim();

  if (!email || !password) {
    showMessage('Please enter email and password', 'error');
    return;
  }

  // Generate username from email
  const username = email.split('@')[0];

  registerBtn.textContent = 'Registering...';
  registerBtn.setAttribute('disabled', 'true');

  const response = await chrome.runtime.sendMessage({
    type: 'REGISTER',
    payload: { email, username, password, apiUrl },
  });

  registerBtn.textContent = 'Register';
  registerBtn.removeAttribute('disabled');

  if (response.success) {
    showMessage('Registration successful!', 'success');
    passwordInput.value = '';
    loadConfig();
  } else {
    showMessage(response.error || 'Registration failed', 'error');
  }
});

// Sync handler
syncBtn.addEventListener('click', async () => {
  syncBtn.textContent = 'Syncing...';
  syncBtn.setAttribute('disabled', 'true');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) {
    showMessage('No active tab found', 'error');
    syncBtn.textContent = 'Sync Bookmarks Now';
    syncBtn.removeAttribute('disabled');
    return;
  }

  chrome.tabs.sendMessage(
    tab.id,
    { type: 'SYNC_NOW' },
    (response) => {
      syncBtn.textContent = 'Sync Bookmarks Now';
      syncBtn.removeAttribute('disabled');

      if (response && response.success) {
        const results = response.results;
        showMessage(
          `Synced! Created: ${results.created}, Skipped: ${results.skipped}`,
          'success'
        );
        loadConfig();
      } else {
        showMessage(response?.error || 'Sync failed', 'error');
      }
    }
  );
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
  const response = await chrome.runtime.sendMessage({ type: 'LOGOUT' });

  if (response.success) {
    showMessage('Logged out successfully', 'success');
    loadConfig();
  }
});

// Auto-sync toggle handler
autoSyncToggle.addEventListener('change', async () => {
  const enabled = autoSyncToggle.checked;
  const intervalMinutes = parseInt(syncInterval.value);

  const response = await chrome.runtime.sendMessage({
    type: 'UPDATE_SYNC_SETTINGS',
    payload: { enabled, intervalMinutes },
  });

  if (response.success) {
    autoSyncStatus.textContent = enabled ? 'Enabled' : 'Disabled';
    showMessage(
      `Auto-sync ${enabled ? 'enabled' : 'disabled'}`,
      'success'
    );
  }
});

// Sync interval change handler
syncInterval.addEventListener('change', async () => {
  const enabled = autoSyncToggle.checked;
  const intervalMinutes = parseInt(syncInterval.value);

  const response = await chrome.runtime.sendMessage({
    type: 'UPDATE_SYNC_SETTINGS',
    payload: { enabled, intervalMinutes },
  });

  if (response.success) {
    const hours = intervalMinutes >= 60 ? `${intervalMinutes / 60}h` : `${intervalMinutes}min`;
    showMessage(`Sync interval updated to ${hours}`, 'success');
  }
});

// Load initial config
loadConfig();

// Refresh bookmark count and sync time every 5 seconds
setInterval(() => {
  getCurrentPageBookmarkCount();
  loadConfig(); // Also refresh last sync time
}, 5000);
