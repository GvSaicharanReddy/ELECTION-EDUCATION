/**
 * Client-Side Cache — Map-based cache with TTL support.
 *
 * Provides a generic, type-safe, in-memory cache abstraction.
 * Can be swapped to Redis or another backend without changing consumers.
 *
 * @module utils/cache
 */

import { CacheEntry, CacheConfig } from '../types/index';

/** Default cache TTL in milliseconds (5 minutes). */
const DEFAULT_TTL_MS = 300000;

/** Default maximum number of cache entries. */
const DEFAULT_MAX_ENTRIES = 100;

/** Default cache configuration. */
const DEFAULT_CONFIG: CacheConfig = {
  defaultTtlMs: DEFAULT_TTL_MS,
  maxEntries: DEFAULT_MAX_ENTRIES,
};

/**
 * In-memory cache with TTL and max-size eviction.
 *
 * Consumers interact with `get`, `set`, `has`, `delete`, and `clear`.
 * The implementation can later be replaced with Redis/Memcached
 * by implementing the same interface.
 */
export class ElectionCache<T = unknown> {
  private readonly store: Map<string, CacheEntry<T>>;
  private readonly config: CacheConfig;

  /**
   * Create a new cache instance.
   *
   * @param config - Optional cache configuration.
   */
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.store = new Map();
  }

  /**
   * Retrieve a value from the cache.
   *
   * Returns undefined if the key does not exist or has expired.
   *
   * @param key - Cache key.
   * @returns The cached value or undefined.
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    this.store.delete(key);
    this.store.set(key, entry);

    return entry.value;
  }

  /**
   * Store a value in the cache.
   *
   * If the cache exceeds maxEntries, the oldest entry is evicted.
   *
   * @param key - Cache key.
   * @param value - Value to cache.
   * @param ttlMs - Optional TTL in milliseconds (overrides default).
   */
  set(key: string, value: T, ttlMs?: number): void {
    // Evict if at capacity
    if (this.store.size >= this.config.maxEntries && !this.store.has(key)) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) {
        this.store.delete(firstKey);
      }
    }

    const now = Date.now();
    const effectiveTtl = ttlMs ?? this.config.defaultTtlMs;

    this.store.set(key, {
      value,
      createdAt: now,
      expiresAt: now + effectiveTtl,
    });
  }

  /**
   * Check if a key exists and is not expired.
   *
   * @param key - Cache key.
   * @returns True if the key exists and is valid.
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) {
      return false;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Remove a specific key from the cache.
   *
   * @param key - Cache key.
   * @returns True if the key was present and removed.
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get the current number of entries (including expired).
   *
   * @returns Number of entries in the store.
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * Remove all expired entries.
   *
   * @returns Number of entries removed.
   */
  prune(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }
}

/**
 * Create a cache key from multiple parts.
 *
 * @param parts - Key segments.
 * @returns Joined cache key string.
 */
export function makeCacheKey(...parts: string[]): string {
  return parts.join(':');
}
