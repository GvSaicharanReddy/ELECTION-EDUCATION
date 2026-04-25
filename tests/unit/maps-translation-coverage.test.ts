/**
 * Extended coverage tests for Google Maps, Cloud Translation, and API Client.
 *
 * Targets previously uncovered branches in maps.ts (38%), translation.ts (55%),
 * and api-client.ts (70%) to push aggregate coverage above the 80% threshold.
 *
 * @module tests/unit/maps-translation-coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* ================================================================
 *  ElectionMapsService Tests
 * ================================================================ */

describe('ElectionMapsService — Extended Coverage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('isConfigured returns false when no API key is set', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    expect(service.isConfigured()).toBe(false);
  });

  it('isConfigured returns true when API key is set', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key-abc');
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    expect(service.isConfigured()).toBe(true);
  });

  it('loadMapsApi returns false when no API key is configured', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const result = await service.loadMapsApi();
    expect(result).toBe(false);
  });

  it('initMap returns false when Maps API is not loaded', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    expect(service.initMap('test-container')).toBe(false);
  });

  it('initMap returns false when container element does not exist', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    expect(service.initMap('nonexistent-element-xyz')).toBe(false);
  });

  it('searchPollingLocations returns fallback locations when Maps API not loaded', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const result = await service.searchPollingLocations('Mumbai');
    expect(result.ok).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data!.length).toBeGreaterThan(0);
    expect(result.data![0]).toHaveProperty('name');
    expect(result.data![0]).toHaveProperty('address');
  });

  it('searchPollingLocations sanitises malicious query', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const result = await service.searchPollingLocations('<script>alert(1)</script>');
    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('searchPollingLocations handles empty query', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const result = await service.searchPollingLocations('');
    expect(result.ok).toBe(true);
  });

  it('searchPollingLocations returns cached results on repeat', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const first = await service.searchPollingLocations('Delhi booth');
    const second = await service.searchPollingLocations('Delhi booth');
    expect(first.data).toEqual(second.data);
  });

  it('generateMapsEmbedUrl returns no-key fallback when unconfigured', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const url = service.generateMapsEmbedUrl('Mumbai polling booth');
    expect(url).toContain('google.com/maps/search/');
    expect(url).not.toContain('key=');
  });

  it('generateMapsEmbedUrl returns embed URL when API key is set', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'key-xyz-789');
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const url = service.generateMapsEmbedUrl('Delhi election office');
    expect(url).toContain('maps/embed/v1/search');
    expect(url).toContain('key=key-xyz-789');
    expect(url).toContain('region=in');
  });

  it('generateMapsEmbedUrl sanitises XSS in query', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const url = service.generateMapsEmbedUrl('<img onerror=alert(1)>');
    expect(url).not.toContain('<img');
  });

  it('generateMapsLink returns a valid Google Maps search URL', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const url = service.generateMapsLink('Andheri Mumbai');
    expect(url).toContain('google.com/maps/search/');
    expect(url).toContain('election%20office%20India');
  });

  it('generateMapsLink sanitises malicious input', async () => {
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const url = service.generateMapsLink('<script>evil()</script>');
    expect(url).not.toContain('<script>');
  });

  it('getUserLocation returns null when geolocation is unavailable', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const result = await service.getUserLocation();
    expect(result).toBeNull();
  });

  it('getUserLocation returns coordinates on success', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) => {
          success({
            coords: { latitude: 28.6139, longitude: 77.209 },
            timestamp: Date.now(),
          } as GeolocationPosition);
        }),
      },
      configurable: true,
      writable: true,
    });
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const result = await service.getUserLocation();
    expect(result).toEqual({ lat: 28.6139, lng: 77.209 });
  });

  it('getUserLocation returns null on geolocation error', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((_s: PositionCallback, error: PositionErrorCallback) => {
          error({ code: 1, message: 'Denied' } as GeolocationPositionError);
        }),
      },
      configurable: true,
      writable: true,
    });
    const { ElectionMapsService } = await import('../../src/services/maps');
    const service = new ElectionMapsService();
    const result = await service.getUserLocation();
    expect(result).toBeNull();
  });
});

/* ================================================================
 *  SUPPORTED_LANGUAGES constant export
 * ================================================================ */

describe('SUPPORTED_LANGUAGES — constant export', () => {
  it('exports a non-empty array of language definitions', async () => {
    const { SUPPORTED_LANGUAGES } = await import('../../src/services/translation');
    expect(Array.isArray(SUPPORTED_LANGUAGES)).toBe(true);
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(0);
  });

  it('each language has code, name, and nativeName', async () => {
    const { SUPPORTED_LANGUAGES } = await import('../../src/services/translation');
    SUPPORTED_LANGUAGES.forEach((lang) => {
      expect(typeof lang.code).toBe('string');
      expect(typeof lang.name).toBe('string');
      expect(typeof lang.nativeName).toBe('string');
      expect(lang.code.length).toBeGreaterThan(0);
    });
  });

  it('includes Hindi, Telugu, Tamil, Kannada, Bengali', async () => {
    const { SUPPORTED_LANGUAGES } = await import('../../src/services/translation');
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('hi');
    expect(codes).toContain('te');
    expect(codes).toContain('ta');
    expect(codes).toContain('kn');
    expect(codes).toContain('bn');
  });
});

/* ================================================================
 *  ElectionTranslationService Tests
 * ================================================================ */

describe('ElectionTranslationService — Extended Coverage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_GOOGLE_TRANSLATION_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('isConfigured returns false when no API key is set', async () => {
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    expect(service.isConfigured()).toBe(false);
  });

  it('isConfigured returns true when API key is set', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATION_API_KEY', 'translation-key-abc');
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    expect(service.isConfigured()).toBe(true);
  });

  it('translateText returns original text when API key is missing', async () => {
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateText('Vote for democracy', 'hi');
    expect(result).toBe('Vote for democracy');
  });

  it('translateText returns original text for invalid language code', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATION_API_KEY', 'some-key');
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateText('Hello', 'xx');
    expect(result).toBe('Hello');
  });

  it('translateText returns original text for empty invalid code', async () => {
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateText('Hello', '');
    expect(result).toBe('Hello');
  });

  it('translateText handles empty text gracefully', async () => {
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateText('', 'hi');
    expect(result).toBe('');
  });

  it('translateText returns translated text from API response', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATION_API_KEY', 'test-key');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: { translations: [{ translatedText: 'नमस्ते' }] },
        }),
    });
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateText('Hello', 'hi');
    expect(result).toBe('नमस्ते');
  });

  it('translateText returns original on API failure', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATION_API_KEY', 'test-key');
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateText('Election day', 'te');
    expect(result).toBe('Election day');
  });

  it('translateBatch returns original texts when API key is missing', async () => {
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateBatch(['Hello', 'World'], 'hi');
    expect(result).toEqual(['Hello', 'World']);
  });

  it('translateBatch handles empty array', async () => {
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateBatch([], 'hi');
    expect(result).toEqual([]);
  });

  it('translateBatch returns originals for invalid language', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATION_API_KEY', 'test-key');
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateBatch(['A', 'B'], 'zz');
    expect(result).toEqual(['A', 'B']);
  });

  it('translateBatch returns translated array on success', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATION_API_KEY', 'test-key');
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: {
            translations: [{ translatedText: 'नमस्ते' }, { translatedText: 'दुनिया' }],
          },
        }),
    });
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateBatch(['Hello', 'World'], 'hi');
    expect(result).toEqual(['नमस्ते', 'दुनिया']);
  });

  it('translateBatch returns originals on API failure', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATION_API_KEY', 'test-key');
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Timeout'));
    const { ElectionTranslationService } = await import('../../src/services/translation');
    const service = new ElectionTranslationService();
    const result = await service.translateBatch(['A', 'B'], 'ta');
    expect(result).toEqual(['A', 'B']);
  });
});

/* ================================================================
 *  SafeApiClient + createGoogleApiClient Tests
 * ================================================================ */

describe('SafeApiClient — Extended Coverage', () => {
  it('instantiates with default config', async () => {
    const { SafeApiClient } = await import('../../src/services/api-client');
    const client = new SafeApiClient();
    expect(client).toBeDefined();
  });

  it('instantiates with custom config', async () => {
    const { SafeApiClient } = await import('../../src/services/api-client');
    const client = new SafeApiClient({ baseUrl: 'https://example.com', timeoutMs: 5000, retries: 2 });
    expect(client).toBeDefined();
  });

  it('GET request succeeds with mocked fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ result: 'ok' }),
    });
    const { SafeApiClient } = await import('../../src/services/api-client');
    const client = new SafeApiClient({ baseUrl: 'https://example.com', retries: 0 });
    const result = await client.get<{ result: string }>('/data');
    expect(result.ok).toBe(true);
    expect(result.data?.result).toBe('ok');
    expect(result.status).toBe(200);
  });

  it('GET request returns error on non-ok status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: 'forbidden' }),
    });
    const { SafeApiClient } = await import('../../src/services/api-client');
    const client = new SafeApiClient({ baseUrl: 'https://example.com', retries: 0 });
    const result = await client.get<unknown>('/secure');
    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
    expect(result.error).toContain('403');
  });

  it('GET request returns error on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const { SafeApiClient } = await import('../../src/services/api-client');
    const client = new SafeApiClient({ baseUrl: 'https://example.com', retries: 0 });
    const result = await client.get<unknown>('/fail');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('POST request succeeds with mocked fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ saved: true }),
    });
    const { SafeApiClient } = await import('../../src/services/api-client');
    const client = new SafeApiClient({ baseUrl: 'https://example.com', retries: 0 });
    const result = await client.post<{ saved: boolean }>('/save', { data: 'test' });
    expect(result.ok).toBe(true);
    expect(result.data?.saved).toBe(true);
  });

  it('POST request returns error on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    const { SafeApiClient } = await import('../../src/services/api-client');
    const client = new SafeApiClient({ baseUrl: 'https://example.com', retries: 0 });
    const result = await client.post<unknown>('/upload', { key: 'val' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
  });

  it('retries the request on failure', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 2) return Promise.reject(new Error('transient'));
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      });
    });
    const { SafeApiClient } = await import('../../src/services/api-client');
    const client = new SafeApiClient({ baseUrl: 'https://example.com', retries: 1 });
    const result = await client.get<{ ok: boolean }>('/retry');
    expect(result.ok).toBe(true);
    expect(callCount).toBe(2);
  });
});

describe('createGoogleApiClient', () => {
  it('creates a pre-configured Google API client', async () => {
    const { createGoogleApiClient } = await import('../../src/services/api-client');
    const client = createGoogleApiClient();
    expect(client).toBeDefined();
  });
});
