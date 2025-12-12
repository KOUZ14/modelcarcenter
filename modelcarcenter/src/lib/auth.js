// Shared authentication utilities
// Consistent session management across all pages

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const LOCAL_WISHLIST_KEY = 'local_wishlist';

/**
 * Get the current authentication token
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Get the current user data
 */
export function getUserData() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_DATA_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  return !!getAuthToken() && !!getUserData();
}

/**
 * Save auth session after login
 */
export function saveSession(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

/**
 * Clear auth session on logout
 */
export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

/**
 * Get Authorization header for API calls
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Get local wishlist (for non-logged in users)
 */
export function getLocalWishlist() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LOCAL_WISHLIST_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save local wishlist
 */
export function saveLocalWishlist(items) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
}

/**
 * Add item to local wishlist
 */
export function addToLocalWishlist(item) {
  const wishlist = getLocalWishlist();
  const exists = wishlist.find(w => w.link === item.link);
  if (!exists) {
    const newWishlist = [...wishlist, { ...item, addedAt: new Date().toISOString() }];
    saveLocalWishlist(newWishlist);
    return newWishlist;
  }
  return wishlist;
}

/**
 * Remove item from local wishlist
 */
export function removeFromLocalWishlist(link) {
  const wishlist = getLocalWishlist();
  const newWishlist = wishlist.filter(w => w.link !== link);
  saveLocalWishlist(newWishlist);
  return newWishlist;
}

/**
 * Check if item is in local wishlist
 */
export function isInLocalWishlist(link) {
  const wishlist = getLocalWishlist();
  return wishlist.some(w => w.link === link);
}

/**
 * Activity tracking
 */
const RECENT_ACTIVITY_KEY = 'recent_activity';
const MAX_ACTIVITY_ITEMS = 20;

export function trackActivity(type, text, metadata = {}) {
  if (typeof window === 'undefined') return;
  
  const activity = getRecentActivity();
  const newActivity = {
    id: Date.now(),
    type, // 'search', 'view', 'wishlist', 'message', 'purchase'
    text,
    metadata,
    timestamp: new Date().toISOString()
  };
  
  // Add to beginning and limit to MAX_ACTIVITY_ITEMS
  const updated = [newActivity, ...activity].slice(0, MAX_ACTIVITY_ITEMS);
  localStorage.setItem(RECENT_ACTIVITY_KEY, JSON.stringify(updated));
  return updated;
}

export function getRecentActivity() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(RECENT_ACTIVITY_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function clearRecentActivity() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_ACTIVITY_KEY);
}
