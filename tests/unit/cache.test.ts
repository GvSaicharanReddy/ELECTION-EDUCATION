/**
 * Unit tests for the client-side cache.
 *
 * @module tests/unit/cache.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ElectionCache, makeCacheKey } from '../../src/utils/cache';

describe('ElectionCache', () => {
  let cache: ElectionCache<string>;

  beforeEach(() => {
    cache = new ElectionCache<string>({ defaultTtlMs: 60000, maxEntries: 5 });
  });

  it('stores and retrieves a value', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns undefined for missing key', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('reports correct size', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    expect(cache.size).toBe(2);
  });

  it('reports existence with has()', () => {
    cache.set('exists', 'yes');
    expect(cache.has('exists')).toBe(true);
    expect(cache.has('missing')).toBe(false);
  });

  it('deletes a key', () => {
    cache.set('temp', 'data');
    expect(cache.delete('temp')).toBe(true);
    expect(cache.get('temp')).toBeUndefined();
  });

  it('clears all entries', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('evicts oldest entry when exceeding maxEntries', () => {
    cache.set('e1', 'v1');
    cache.set('e2', 'v2');
    cache.set('e3', 'v3');
    cache.set('e4', 'v4');
    cache.set('e5', 'v5');
    // Adding 6th should evict e1
    cache.set('e6', 'v6');
    expect(cache.get('e1')).toBeUndefined();
    expect(cache.get('e6')).toBe('v6');
    expect(cache.size).toBe(5);
  });

  it('returns undefined for expired entries', () => {
    vi.useFakeTimers();
    cache.set('expiring', 'data', 1000); // 1 second TTL
    vi.advanceTimersByTime(1500);
    expect(cache.get('expiring')).toBeUndefined();
    vi.useRealTimers();
  });

  it('returns valid entries before expiration', () => {
    vi.useFakeTimers();
    cache.set('fresh', 'data', 5000);
    vi.advanceTimersByTime(2000);
    expect(cache.get('fresh')).toBe('data');
    vi.useRealTimers();
  });

  it('prunes expired entries', () => {
    vi.useFakeTimers();
    cache.set('old1', 'v1', 100);
    cache.set('old2', 'v2', 100);
    cache.set('fresh', 'v3', 10000);
    vi.advanceTimersByTime(500);
    const removed = cache.prune();
    expect(removed).toBe(2);
    expect(cache.size).toBe(1);
    expect(cache.get('fresh')).toBe('v3');
    vi.useRealTimers();
  });
});

describe('makeCacheKey', () => {
  it('joins parts with colons', () => {
    expect(makeCacheKey('gemini', 'election', 'query')).toBe('gemini:election:query');
  });

  it('handles single part', () => {
    expect(makeCacheKey('solo')).toBe('solo');
  });
});
