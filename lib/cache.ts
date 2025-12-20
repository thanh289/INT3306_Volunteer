// Simple in-memory cache utility for backend
// lib/cache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>>;
  private blockedPatterns: Map<string, number>; // Pattern -> expiry timestamp
  private defaultTTL: number; // Time to live in milliseconds

  constructor(defaultTTL: number = 60000) {
    // Default 1 minute
    this.cache = new Map();
    this.blockedPatterns = new Map();
    this.defaultTTL = defaultTTL;

    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 300000);
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Check if this key matches any blocked pattern
    const now = Date.now();
    for (const [pattern, expiry] of this.blockedPatterns.entries()) {
      if (now < expiry && key.includes(pattern)) {
        console.log(
          `Cache set blocked for key "${key}" due to pattern "${pattern}"`
        );
        return; // Don't cache
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.defaultTTL),
    });
  }

  get<T>(key: string): T | null {
    // Check if this key matches any blocked pattern first
    const now = Date.now();
    const blockedList = Array.from(this.blockedPatterns.entries());

    if (blockedList.length > 0 && key.includes("dashboard:posts:")) {
      console.log(
        `Cache.get("${key}"): Checking ${blockedList.length} blocked patterns`,
        blockedList
      );
    }

    for (const [pattern, expiry] of blockedList) {
      if (now < expiry && key.includes(pattern)) {
        console.log(
          `Cache get BLOCKED for key "${key}" due to pattern "${pattern}"`
        );
        // Delete the cache entry to ensure it's not served
        this.cache.delete(key);
        return null;
      }
    }

    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: string, blockDurationMs: number = 2000): void {
    const keys = Array.from(this.cache.keys());
    const matchedKeys: string[] = [];
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        matchedKeys.push(key);
      }
    });

    // Block this pattern from being cached for the specified duration
    this.blockedPatterns.set(pattern, Date.now() + blockDurationMs);
    console.log(
      `Cache invalidatePattern("${pattern}"): deleted ${matchedKeys.length} keys, blocked for ${blockDurationMs}ms`,
      matchedKeys.length > 0 ? matchedKeys.slice(0, 3) : []
    );
  }

  private cleanup(): void {
    const now = Date.now();

    // Clean expired cache entries
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      const entry = this.cache.get(key);
      if (entry && now > entry.timestamp) {
        this.cache.delete(key);
      }
    });

    // Clean expired blocked patterns
    for (const [pattern, expiry] of this.blockedPatterns.entries()) {
      if (now > expiry) {
        this.blockedPatterns.delete(pattern);
      }
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create cache instances with different TTLs
export const apiCache = new Cache(60000); // 1 minute for API responses
export const dataCache = new Cache(300000); // 5 minutes for data queries
export const shortCache = new Cache(10000); // 10 seconds for frequently changing data
