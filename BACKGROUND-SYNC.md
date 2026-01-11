# 🔄 Automatic Background Sync

Your Twitter Bookmarks Organizer syncs **automatically in the background** - no need to visit Twitter!

## ✨ How It Works

The browser extension runs **periodic background syncs** that:
1. Opens Twitter bookmarks page in a hidden tab
2. Scrapes your bookmarks automatically
3. Syncs them to your backend
4. Auto-organizes with categories and tags
5. Closes the hidden tab
6. Shows a notification if new bookmarks were found

**You don't need to do anything!** It just works. 🎉

---

## ⚙️ Configuration

### Default Settings

- **Auto-Sync**: Enabled by default
- **Interval**: Every 30 minutes
- **Notification**: Shows when new bookmarks are added

### Customize Settings

Click the extension icon to configure:

1. **Enable/Disable Auto-Sync**
   - Toggle the checkbox to turn on/off
   - When disabled, only manual sync works

2. **Change Sync Interval**
   - 15 minutes (most frequent)
   - 30 minutes (recommended)
   - 1 hour
   - 2 hours
   - 6 hours (least frequent)

3. **View Last Sync Time**
   - Shows when the last sync occurred
   - Updates every 5 seconds

---

## 🔔 Notifications

You'll receive a browser notification when:
- New bookmarks are synced
- Shows count of new bookmarks added

Example: "Bookmarks Synced! Added 5 new bookmarks"

To disable notifications:
- Go to browser settings
- Manage extension permissions
- Turn off "Notifications" permission

---

## 📊 How Background Sync Works

### Technical Flow:

```
1. Chrome Alarms API triggers every X minutes
   ↓
2. Background service worker wakes up
   ↓
3. Checks if user is logged in
   ↓
4. Opens https://twitter.com/i/bookmarks in hidden tab
   ↓
5. Waits for page to load (3 seconds)
   ↓
6. Content script scans bookmarks on page
   ↓
7. Sends bookmarks to backend API
   ↓
8. Backend auto-categorizes and tags
   ↓
9. Closes hidden tab
   ↓
10. Shows notification if new bookmarks added
   ↓
11. Updates "Last Sync" time
```

**Total time per sync**: ~5-10 seconds
**Resource usage**: Minimal (runs in background)

---

## 🎯 Use Cases

### 1. Set It and Forget It

```
Enable auto-sync → Close browser → Come back later
All your new bookmarks are already synced & organized!
```

### 2. Frequent Syncing (Power Users)

```
Set interval to 15 minutes
Get near real-time bookmark syncing
```

### 3. Battery Saving (Mobile/Laptop)

```
Set interval to 6 hours
Reduce background activity
Sync only a few times per day
```

### 4. Manual Control

```
Disable auto-sync
Use "Sync Bookmarks Now" button when you want
Full control over when syncing happens
```

---

## 🔒 Privacy & Security

### What Happens During Background Sync:

✅ **Does**:
- Opens Twitter in a hidden tab (not visible)
- Reads bookmark data from the DOM
- Sends to YOUR backend (localhost or your server)
- Closes tab immediately after

❌ **Does NOT**:
- Access your Twitter password
- Read DMs or private data
- Send data to third parties
- Track your browsing

### Permissions Required:

- **`alarms`** - Schedule periodic syncs
- **`tabs`** - Open/close hidden tabs
- **`notifications`** - Show sync notifications
- **`storage`** - Save sync settings
- **`host_permissions`** - Access Twitter/X.com

All permissions are **required** for background sync to work.

---

## 🛠️ Troubleshooting

### Sync Not Running

**Check:**
1. Auto-sync toggle is ON in extension popup
2. You're logged in (check extension popup)
3. Browser is running (background sync needs browser open)

**Fix:**
```
1. Click extension icon
2. Make sure "Auto-Sync: Enabled" is shown
3. Check "Last Sync" time
4. Click "Sync Bookmarks Now" to test
```

---

### Too Many/Few Syncs

**Adjust interval:**
```
Extension icon → Interval dropdown → Select frequency
```

**Recommendations:**
- **Active users**: 15-30 minutes
- **Moderate users**: 1-2 hours
- **Casual users**: 6 hours

---

### Notifications Too Frequent

**Option 1**: Disable in extension
```
Chrome → Settings → Extensions → Twitter Bookmarks Organizer
→ Permissions → Uncheck "Notifications"
```

**Option 2**: System notification settings
```
OS Settings → Notifications → Chrome → Manage
```

---

### Battery/Performance Impact

Background sync is designed to be **lightweight**:

- Only runs when scheduled (not continuous)
- Opens tab for ~10 seconds max
- Minimal CPU/memory usage
- No impact when browser is closed

**To reduce further:**
- Increase sync interval (e.g., 6 hours)
- Disable auto-sync, use manual sync
- Close browser when not in use

---

## 📈 Sync Statistics

Track your sync activity in the extension popup:

- **Bookmarks Synced**: Total count
- **Last Sync**: Time since last sync
- **On This Page**: Current page count (if on Twitter)

---

## 🔄 vs Manual Sync

| Feature | Background Sync | Manual Sync |
|---------|----------------|-------------|
| Requires page visit | ❌ No | ✅ Yes |
| Automatic | ✅ Yes | ❌ No |
| Frequency | Configurable | On-demand |
| Best for | Set & forget | Full control |
| Resource usage | Low | None (when not syncing) |

**Recommendation**: Use both!
- Background sync for automatic updates
- Manual sync when you want immediate refresh

---

## 💡 Pro Tips

### 1. Optimal Interval

```
Bookmark 5-10 tweets/day → Set to 2-6 hours
Bookmark 20-50 tweets/day → Set to 30-60 minutes
Bookmark 100+ tweets/day → Set to 15 minutes
```

### 2. Battery Saver Mode

```
On laptop/mobile → Increase interval to 6 hours
On desktop → Use 30 minutes
```

### 3. Always Fresh Data

```
Enable auto-sync (30 min)
+ Manual sync before important searches
= Always up-to-date bookmarks!
```

### 4. Travel/Offline

```
Disable auto-sync before traveling
Re-enable when back online
Prevents failed sync attempts
```

---

## 🎓 Advanced Configuration

### Chrome Flags (Optional)

For even better background sync performance:

1. `chrome://flags/#enable-parallel-downloading` → Enabled
2. `chrome://flags/#back-forward-cache` → Enabled

### Service Worker Persistence

Chrome may pause service workers to save resources. To keep them running:

```
chrome://serviceworker-internals/
Find "Twitter Bookmarks Organizer"
Check "Keep active" (developer mode only)
```

**Note**: Not needed for normal use, only for debugging.

---

## 🚀 Future Enhancements

Planned features:

- [ ] Sync only new bookmarks (smarter detection)
- [ ] Batch sync (collect multiple then sync once)
- [ ] Offline queue (sync when connection restored)
- [ ] Conflict resolution (if bookmark changed)
- [ ] Sync across devices (with account)

---

## ❓ FAQ

**Q: Does browser need to be open for auto-sync?**
A: Yes, but can be minimized or in background.

**Q: What if I'm not logged into Twitter?**
A: Sync will fail silently. Login to Twitter in browser first.

**Q: Can I sync while browsing other sites?**
A: Yes! Sync runs in background, doesn't interrupt browsing.

**Q: How much data does sync use?**
A: ~50-200KB per sync (loads Twitter page once).

**Q: Will it drain my battery?**
A: Minimal impact. ~0.1% battery per sync on laptops.

**Q: Can I sync multiple Twitter accounts?**
A: Not yet. One account per extension install.

---

**Background sync makes your bookmarks always up-to-date! 🎉**

Set it once, never think about it again. Your bookmarks organize themselves while you browse!
