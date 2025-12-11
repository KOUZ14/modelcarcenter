/**
 * Simple frontend tests for ModelCarCenter
 * Tests utility functions and component behavior
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock localStorage for testing
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// Import auth utilities
const {
  getAuthToken,
  getUserData,
  isLoggedIn,
  saveSession,
  clearSession,
  getAuthHeaders,
  getLocalWishlist,
  saveLocalWishlist,
  addToLocalWishlist,
  removeFromLocalWishlist,
  isInLocalWishlist,
} = require('../src/lib/auth');

describe('Authentication Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and retrieve auth token', () => {
    const token = 'test-token-123';
    const user = { username: 'testuser', email: 'test@example.com' };
    
    saveSession(token, user);
    
    expect(getAuthToken()).toBe(token);
    expect(getUserData()).toEqual(user);
    expect(isLoggedIn()).toBe(true);
  });

  it('should clear session on logout', () => {
    saveSession('token', { username: 'user' });
    clearSession();
    
    expect(getAuthToken()).toBeNull();
    expect(getUserData()).toBeNull();
    expect(isLoggedIn()).toBe(false);
  });

  it('should generate proper auth headers', () => {
    const token = 'my-secure-token';
    saveSession(token, { username: 'user' });
    
    const headers = getAuthHeaders();
    expect(headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('should return empty object when no token', () => {
    clearSession();
    const headers = getAuthHeaders();
    expect(headers).toEqual({});
  });
});

describe('Wishlist Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and retrieve wishlist', () => {
    const items = [
      { title: 'Ferrari 488', price: 149.99, link: 'http://example.com/1' },
      { title: 'Porsche 911', price: 99.99, link: 'http://example.com/2' },
    ];
    
    saveLocalWishlist(items);
    const retrieved = getLocalWishlist();
    
    expect(retrieved).toEqual(items);
    expect(retrieved).toHaveLength(2);
  });

  it('should add item to wishlist', () => {
    const item = { title: 'BMW M3', price: 79.99, link: 'http://example.com/bmw' };
    
    addToLocalWishlist(item);
    const wishlist = getLocalWishlist();
    
    expect(wishlist).toHaveLength(1);
    expect(wishlist[0]).toEqual(item);
  });

  it('should not add duplicate items', () => {
    const item = { title: 'Audi R8', price: 119.99, link: 'http://example.com/audi' };
    
    addToLocalWishlist(item);
    addToLocalWishlist(item); // Try to add again
    
    const wishlist = getLocalWishlist();
    expect(wishlist).toHaveLength(1); // Should only have one item
  });

  it('should remove item from wishlist', () => {
    const item1 = { title: 'Car 1', link: 'http://example.com/1' };
    const item2 = { title: 'Car 2', link: 'http://example.com/2' };
    
    addToLocalWishlist(item1);
    addToLocalWishlist(item2);
    
    removeFromLocalWishlist(item1.link);
    
    const wishlist = getLocalWishlist();
    expect(wishlist).toHaveLength(1);
    expect(wishlist[0].link).toBe(item2.link);
  });

  it('should check if item is in wishlist', () => {
    const item = { title: 'Test Car', link: 'http://example.com/test' };
    
    expect(isInLocalWishlist(item.link)).toBe(false);
    
    addToLocalWishlist(item);
    
    expect(isInLocalWishlist(item.link)).toBe(true);
  });

  it('should return empty array for corrupted wishlist data', () => {
    localStorage.setItem('local_wishlist', 'invalid-json');
    const wishlist = getLocalWishlist();
    expect(wishlist).toEqual([]);
  });
});

describe('User Data Handling', () => {
  it('should handle corrupted user data gracefully', () => {
    localStorage.setItem('user_data', 'not-json');
    const userData = getUserData();
    expect(userData).toBeNull();
  });

  it('should return null when no user data exists', () => {
    const userData = getUserData();
    expect(userData).toBeNull();
  });

  it('should store user data as JSON', () => {
    const user = {
      username: 'john_doe',
      email: 'john@example.com',
      account_type: 'collector',
    };
    
    saveSession('token', user);
    const retrieved = getUserData();
    
    expect(retrieved.username).toBe(user.username);
    expect(retrieved.email).toBe(user.email);
    expect(retrieved.account_type).toBe(user.account_type);
  });
});
