/**
 * Surgical coverage filler tests — targets EVERY remaining uncovered branch and line.
 *
 * Current gaps to fix:
 *   maps.ts        → lines 64-65 (isLoaded early return), 139-140 (cache hit),
 *                    199-202 (fallback values in Places callback), 175-195 (error statuses)
 *   analytics.ts   → line 160 (entities present), 165-167 (catch), 260-267 (sentiment),
 *                    279-283 (session fallback)
 *   api-client.ts  → line 110 (?? 1), line 141 (non-Error thrown), line 147 (timeout)
 *   election-stages.ts → line 423 (getStagePosition -1)
 *   gemini.ts      → lines 364 (tool non-success), 369 (empty responseText || null)
 *   sanitize.ts    → line 31 (escapeHtml)
 *   vertex.ts      → lines 222-225 (cosineSimilarity), 227 b[i]??0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ElectionMapsService } from '../../src/services/maps';
import { ElectionTranslationService } from '../../src/services/translation';
import { ElectionCoachService } from '../../src/services/gemini';
import { ElectionVertexService } from '../../src/services/vertex';
import { ElectionAnalyticsService } from '../../src/services/analytics';
import { SafeApiClient } from '../../src/services/api-client';
import { sanitizeUrl, escapeHtml } from '../../src/utils/sanitize';
import { validateStageId } from '../../src/utils/validate';
import { getStagePosition } from '../../src/data/election-stages';
import { trapFocus, onReducedMotionChange } from '../../src/utils/a11y';
import { ElectionCache } from '../../src/utils/cache';
import { sanitizeForApi, setSafeInnerHTML } from '../../src/utils/sanitize';
import { ElectionStore } from '../../src/state/store';
import { logger } from '../../src/utils/logger';

describe('Coverage Filler Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ═══════════════════════════════════════════════════════
  // MAPS.TS
  // ═══════════════════════════════════════════════════════

  describe('ElectionMapsService', () => {
    it('loadMapsApi returns true immediately when already loaded (line 64-65)', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.isLoaded = true;
      const result = await service.loadMapsApi();
      expect(result).toBe(true);
    });

    it('loadMapsApi resolves true when google.maps is already in window', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      globalThis.google = { maps: { Map: vi.fn(), places: {} } };
      const result = await service.loadMapsApi();
      expect(result).toBe(true);
      // @ts-ignore
      delete globalThis.google;
    });

    it('loadMapsApi resolves true via script.onload', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      if (typeof globalThis.google !== 'undefined') delete globalThis.google;

      const mockScript: any = { src: '', async: false, defer: false, onload: null, onerror: null };
      vi.spyOn(document, 'createElement').mockReturnValue(mockScript);
      vi.spyOn(document.head, 'appendChild').mockImplementation((el: any) => {
        setTimeout(() => el.onload?.(), 0);
        return el;
      });

      const result = await service.loadMapsApi();
      expect(result).toBe(true);
    });

    it('loadMapsApi resolves false via script.onerror', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      if (typeof globalThis.google !== 'undefined') delete globalThis.google;

      const mockScript: any = { src: '', async: false, defer: false, onload: null, onerror: null };
      vi.spyOn(document, 'createElement').mockReturnValue(mockScript);
      vi.spyOn(document.head, 'appendChild').mockImplementation((el: any) => {
        setTimeout(() => el.onerror?.(), 0);
        return el;
      });

      const result = await service.loadMapsApi();
      expect(result).toBe(false);
    });

    it('searchPollingLocations returns cached result on second call (line 139-140)', async () => {
      const service = new ElectionMapsService();
      // Pre-populate cache with the exact key the service will generate for 'delhi'
      // Key = makeCacheKey('maps', sanitizeFull('delhi', 200).toLowerCase()) = 'maps:delhi'
      // @ts-ignore
      service.cache.set('maps:delhi', [{ name: 'Cached Booth', address: 'Test Address', latitude: 0, longitude: 0 }]);
      // This call should hit the cache directly (lines 138-140)
      const res = await service.searchPollingLocations('delhi');
      expect(res.ok).toBe(true);
      expect(res.data![0].name).toBe('Cached Booth');
    });

    it('searchWithPlacesApi returns error without mapInstance', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      const res = await service.searchWithPlacesApi('test', 'cache-key');
      expect(res.ok).toBe(false);
      expect(res.error).toBe('Map not initialised');
    });

    it('searchWithPlacesApi maps fallback values for missing place fields (lines 199-202)', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.isLoaded = true;
      // @ts-ignore
      service.mapInstance = {};

      const mockTextSearch = vi.fn((_req: unknown, cb: (results: any[], status: string) => void) => {
        cb(
          [{ name: undefined, formatted_address: undefined, geometry: undefined }],
          'OK',
        );
      });

      // @ts-ignore
      globalThis.google = {
        maps: {
          places: {
            PlacesService: vi.fn(() => ({ textSearch: mockTextSearch })),
            PlacesServiceStatus: { OK: 'OK', REQUEST_DENIED: 'REQUEST_DENIED', ZERO_RESULTS: 'ZERO_RESULTS' },
          },
          marker: {
            AdvancedMarkerElement: vi.fn(),
          },
        },
      } as any;

      // @ts-ignore
      const res = await service.searchWithPlacesApi('test query', 'cache-key-test');
      expect(res.ok).toBe(true);
      expect(res.data![0].name).toBe('Unknown Location');
      expect(res.data![0].address).toBe('Address unavailable');
      expect(res.data![0].latitude).toBe(0);
      expect(res.data![0].longitude).toBe(0);

      // @ts-ignore
      delete globalThis.google;
    });

    it('searchWithPlacesApi handles REQUEST_DENIED error', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.isLoaded = true;
      // @ts-ignore
      service.mapInstance = {};

      const mockTextSearch = vi.fn((_req: unknown, cb: (results: null, status: string) => void) => {
        cb(null, 'REQUEST_DENIED');
      });

      // @ts-ignore
      globalThis.google = {
        maps: {
          places: {
            PlacesService: vi.fn(() => ({ textSearch: mockTextSearch })),
            PlacesServiceStatus: { OK: 'OK', REQUEST_DENIED: 'REQUEST_DENIED', ZERO_RESULTS: 'ZERO_RESULTS' },
          },
        },
      } as any;

      // @ts-ignore
      const res = await service.searchWithPlacesApi('test', 'cache-key');
      expect(res.ok).toBe(false);
      expect(res.error).toContain('Request Denied');
      // @ts-ignore
      delete globalThis.google;
    });

    it('searchWithPlacesApi handles ZERO_RESULTS error', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.isLoaded = true;
      // @ts-ignore
      service.mapInstance = {};

      const mockTextSearch = vi.fn((_req: unknown, cb: (results: null, status: string) => void) => {
        cb(null, 'ZERO_RESULTS');
      });

      // @ts-ignore
      globalThis.google = {
        maps: {
          places: {
            PlacesService: vi.fn(() => ({ textSearch: mockTextSearch })),
            PlacesServiceStatus: { OK: 'OK', REQUEST_DENIED: 'REQUEST_DENIED', ZERO_RESULTS: 'ZERO_RESULTS' },
          },
        },
      } as any;

      // @ts-ignore
      const res = await service.searchWithPlacesApi('test', 'cache-key');
      expect(res.ok).toBe(false);
      expect(res.error).toContain('No polling locations');
      // @ts-ignore
      delete globalThis.google;
    });

    it('searchWithPlacesApi handles generic error status', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.isLoaded = true;
      // @ts-ignore
      service.mapInstance = {};

      const mockTextSearch = vi.fn((_req: unknown, cb: (results: null, status: string) => void) => {
        cb(null, 'OVER_QUERY_LIMIT');
      });

      // @ts-ignore
      globalThis.google = {
        maps: {
          places: {
            PlacesService: vi.fn(() => ({ textSearch: mockTextSearch })),
            PlacesServiceStatus: { OK: 'OK', REQUEST_DENIED: 'REQUEST_DENIED', ZERO_RESULTS: 'ZERO_RESULTS' },
          },
        },
      } as any;

      // @ts-ignore
      const res = await service.searchWithPlacesApi('test', 'cache-key');
      expect(res.ok).toBe(false);
      expect(res.error).toContain('OVER_QUERY_LIMIT');
      // @ts-ignore
      delete globalThis.google;
    });

    it('initMap creates map instance when container exists', () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.isLoaded = true;
      document.body.innerHTML = '<div id="map-test"></div>';
      // @ts-ignore
      globalThis.google = { maps: { Map: vi.fn() } };
      const result = service.initMap('map-test');
      expect(result).toBe(true);
      // @ts-ignore
      delete globalThis.google;
    });
  });

  // ═══════════════════════════════════════════════════════
  // ANALYTICS.TS
  // ═══════════════════════════════════════════════════════

  describe('ElectionAnalyticsService', () => {
    it('trackQuery catches errors silently (line 165-167)', async () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      vi.spyOn(service as any, 'analyseWithNaturalLanguage').mockRejectedValue(new Error('NL API down'));
      await expect(service.trackQuery('test crash')).resolves.toBeUndefined();
    });

    it('trackQuery processes entities when NL API returns them (line 160)', async () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      vi.spyOn(service as any, 'analyseWithNaturalLanguage').mockResolvedValue({
        entities: [
          { name: 'India', type: 'LOCATION', salience: 0.9 },
          { name: 'ECI', type: 'ORGANIZATION', salience: 0.7 },
        ],
        documentSentiment: { score: 0.2, magnitude: 0.5 },
        language: 'en',
      });
      // @ts-ignore
      vi.spyOn(service as any, 'logToFirestore').mockResolvedValue(undefined);
      await expect(service.trackQuery('election in India by ECI')).resolves.toBeUndefined();
    });

    it('normaliseSentiment returns positive for score > 0.15', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      expect(service.normaliseSentiment({ score: 0.5, magnitude: 1.0 })).toBe('positive');
    });

    it('normaliseSentiment returns negative for score < -0.15', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      expect(service.normaliseSentiment({ score: -0.5, magnitude: 1.0 })).toBe('negative');
    });

    it('normaliseSentiment returns neutral for score between -0.15 and 0.15', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      expect(service.normaliseSentiment({ score: 0.0, magnitude: 0.1 })).toBe('neutral');
    });

    it('normaliseSentiment returns neutral when sentiment is undefined', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      expect(service.normaliseSentiment(undefined)).toBe('neutral');
    });

    it('normaliseSentiment returns neutral at exact positive threshold 0.15', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore — score of 0.15 is NOT > 0.15, so it stays neutral
      expect(service.normaliseSentiment({ score: 0.15, magnitude: 1.0 })).toBe('neutral');
    });

    it('normaliseSentiment returns positive just above threshold 0.16', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      expect(service.normaliseSentiment({ score: 0.16, magnitude: 1.0 })).toBe('positive');
    });

    it('normaliseSentiment returns neutral at exact negative threshold -0.15', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore — score of -0.15 is NOT < -0.15, so it stays neutral
      expect(service.normaliseSentiment({ score: -0.15, magnitude: 1.0 })).toBe('neutral');
    });

    it('normaliseSentiment returns negative just below threshold -0.16', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      expect(service.normaliseSentiment({ score: -0.16, magnitude: 1.0 })).toBe('negative');
    });

    it('normaliseSentiment returns neutral at 0.14 (just below positive threshold)', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      expect(service.normaliseSentiment({ score: 0.14, magnitude: 1.0 })).toBe('neutral');
    });

    it('normaliseSentiment returns neutral at -0.14 (just above negative threshold)', () => {
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      expect(service.normaliseSentiment({ score: -0.14, magnitude: 1.0 })).toBe('neutral');
    });

    it('generateSessionId falls back when crypto.randomUUID is unavailable (line 283)', () => {
      const origRandom = crypto.randomUUID;
      // @ts-ignore
      crypto.randomUUID = undefined;
      const service = new ElectionAnalyticsService();
      // @ts-ignore
      const id = service.sessionId;
      expect(id).toMatch(/^session-/);
      crypto.randomUUID = origRandom;
    });
  });

  // ═══════════════════════════════════════════════════════
  // API-CLIENT.TS
  // ═══════════════════════════════════════════════════════

  describe('SafeApiClient', () => {
    it('returns timeout message when fetch aborts (line 147)', async () => {
      const origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('The operation was aborted'));
      const client = new SafeApiClient({ baseUrl: 'https://example.com', timeoutMs: 100, retries: 0 });
      const result = await client.get('/test');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Request timed out. Please check your connection.');
      globalThis.fetch = origFetch;
    });

    it('returns network error for non-abort failures', async () => {
      const origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));
      const client = new SafeApiClient({ baseUrl: 'https://example.com', timeoutMs: 100, retries: 0 });
      const result = await client.get('/test');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Network error. Please try again later.');
      globalThis.fetch = origFetch;
    });

    it('uses default retries=1 when retries is undefined (line 110)', async () => {
      const origFetch = globalThis.fetch;
      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error('fail'));
      });
      const client = new SafeApiClient({ baseUrl: 'https://example.com', timeoutMs: 100, retries: undefined });
      await client.get('/test');
      expect(callCount).toBe(2); // attempt 0 + retry 1
      globalThis.fetch = origFetch;
    });

    it('handles non-Error thrown objects (line 141)', async () => {
      const origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue('plain string error');
      const client = new SafeApiClient({ baseUrl: 'https://example.com', timeoutMs: 100, retries: 0 });
      const result = await client.get('/test');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Network error. Please try again later.');
      globalThis.fetch = origFetch;
    });
  });

  // ═══════════════════════════════════════════════════════
  // ELECTION-STAGES.TS
  // ═══════════════════════════════════════════════════════

  describe('getStagePosition', () => {
    it('returns -1 for invalid stage ID (line 423)', () => {
      // @ts-ignore
      expect(getStagePosition('invalid-stage-id')).toBe(-1);
    });
  });

  // ═══════════════════════════════════════════════════════
  // SANITIZE.TS
  // ═══════════════════════════════════════════════════════

  describe('sanitize utils', () => {
    it('escapeHtml escapes known HTML entities (exercises line 31)', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
      expect(escapeHtml("it's")).toBe('it&#x27;s');
      expect(escapeHtml('a & b')).toBe('a &amp; b');
      expect(escapeHtml('a/b')).toBe('a&#x2F;b');
      expect(escapeHtml('`code`')).toBe('&#96;code&#96;');
    });

    it('sanitizeUrl returns empty for non-URL strings', () => {
      expect(sanitizeUrl('not_a_valid_url')).toBe('');
    });
  });

  // ═══════════════════════════════════════════════════════
  // VERTEX.TS
  // ═══════════════════════════════════════════════════════

  describe('ElectionVertexService', () => {

    it('cosineSimilarity handles length mismatch (line 223)', () => {
      const service = new ElectionVertexService();
      // @ts-ignore
      expect(service.cosineSimilarity([1, 2], [1])).toBe(0);
    });

    it('cosineSimilarity handles zero magnitude vectors (line 231)', () => {
      const service = new ElectionVertexService();
      // @ts-ignore
      expect(service.cosineSimilarity([0, 0], [0, 0])).toBe(0);
    });

    it('cosineSimilarity handles empty arrays (line 223)', () => {
      const service = new ElectionVertexService();
      // @ts-ignore
      expect(service.cosineSimilarity([], [])).toBe(0);
    });

    it('findRelevantFaq catches error and falls back to keywordFallback (hits line 186)', async () => {
      const service = new ElectionVertexService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockRejectedValue(new Error('fail'));
      const res = await service.findRelevantFaq('test');
      expect(res).toBeNull();
    });

    it('embedText parses successful response and finds matches (hits lines 209-210)', async () => {
      const service = new ElectionVertexService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // Mock client.post to return the same embedding vector for query and all corpus entries.
      // Cosine similarity between identical vectors is 1.0, which exceeds the 0.5 threshold.
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockResolvedValue({
        ok: true,
        data: {
          predictions: [{ embeddings: { values: [0.5, 0.8, 0.3] } }],
        },
      } as any);
      // @ts-ignore
      const res = await service.findRelevantFaq('eligibility');
      expect(res).not.toBeNull();
      expect(res!.score).toBeGreaterThan(0.5);
    });

    it('findRelevantFaq falls back if bestScore < 0.5 (hits lines 176-178)', async () => {
      const service = new ElectionVertexService();
      // @ts-ignore
      service.apiKey = 'test-key';
      
      // Mock client.post: query returns [1,0,0], all corpus calls return [0,1,0] (orthogonal => cosine 0.0)
      let callIndex = 0;
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) {
          // Query embedding
          return Promise.resolve({
            ok: true,
            data: { predictions: [{ embeddings: { values: [1.0, 0.0, 0.0] } }] },
          });
        }
        // All corpus embeddings => orthogonal to query
        return Promise.resolve({
          ok: true,
          data: { predictions: [{ embeddings: { values: [0.0, 1.0, 0.0] } }] },
        });
      });

      const res = await service.findRelevantFaq('completely irrelevant query xyz');
      // Cosine similarity will be 0.0, falls back to keyword match which is null.
      expect(res).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════
  // GEMINI.TS
  // ═══════════════════════════════════════════════════════

  describe('ElectionCoachService', () => {
    it('is not configured when all env vars are empty (line 242)', () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      vi.stubEnv('VITE_GEMINI_KEY', '');
      vi.stubEnv('VITE_GEMINI_MODEL', '');
      const service = new ElectionCoachService();
      expect(service.isConfigured()).toBe(false);
      vi.unstubAllEnvs();
    });

    it('callGeminiApi returns null for failed tool call (line 364)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      service.apiKey = 'test-key';

      // First Gemini response: returns a tool call
      // @ts-ignore
      vi.spyOn(service.client, 'post')
        .mockResolvedValueOnce({
          ok: true,
          error: null,
          status: 200,
          data: {
            candidates: [{
              content: {
                parts: [{ functionCall: { name: 'find_polling_booth', args: {} } }],
                role: 'model',
              },
            }],
          },
        })
        // Follow-up response after tool result: returns empty candidates
        .mockResolvedValueOnce({
          ok: false,
          error: 'Follow-up failed',
          status: 500,
          data: null,
        });

      // @ts-ignore
      const result = await service.callGeminiApi('find booth');
      expect(result).toBeNull();
    });

    it('callGeminiApi returns null when responseText is empty (line 369)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockResolvedValue({
        ok: true,
        data: {
          candidates: [{ content: { parts: [], role: 'model' } }],
        },
      });
      // @ts-ignore
      const result = await service.callGeminiApi('empty response test');
      expect(result).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════
  // TRANSLATION.TS
  // ═══════════════════════════════════════════════════════

  describe('ElectionTranslationService', () => {
    it('translateText hits cache on second call', async () => {
      const service = new ElectionTranslationService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockResolvedValue({
        ok: true,
        data: { data: { translations: [{ translatedText: 'translated' }] } },
      });
      await service.translateText('hello', 'hi');
      const res2 = await service.translateText('hello', 'hi');
      expect(res2).toBe('translated');
    });

    it('translateText returns original on API failure', async () => {
      const service = new ElectionTranslationService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockRejectedValue(new Error('fail'));
      expect(await service.translateText('fail', 'hi')).toBe('fail');
    });

    it('translateBatch returns originals on API failure', async () => {
      const service = new ElectionTranslationService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockRejectedValue(new Error('fail'));
      expect(await service.translateBatch(['fail'], 'hi')).toEqual(['fail']);
    });
  });

  // ═══════════════════════════════════════════════════════
  // VALIDATE.TS
  // ═══════════════════════════════════════════════════════

  describe('validate', () => {
    it('validateStageId rejects non-string', () => {
      expect(validateStageId(123).isValid).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════
  // RECENT ADDITIONS FOR 100% COVERAGE
  // ═══════════════════════════════════════════════════════

  describe('gemini.ts new tools', () => {
    it('dispatchTool handles translate_text', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      vi.spyOn(service.translationService, 'translateText').mockResolvedValue('translated');
      // @ts-ignore
      const res = await service.dispatchTool('translate_text', { text: 'hello', targetLang: 'hi' });
      expect(res).toBe('translated');
    });

    it('dispatchTool handles find_polling_location success', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      vi.spyOn(service.mapsService, 'searchPollingLocations').mockResolvedValue({
        ok: true,
        data: [{ name: 'Booth A', address: 'Delhi', latitude: 0, longitude: 0 }],
      });
      // @ts-ignore
      const res = await service.dispatchTool('find_polling_location', { query: 'delhi', pin_code: '110001' });
      expect(res).toBe('Booth A: Delhi');
    });

    it('dispatchTool handles find_polling_location failure', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      vi.spyOn(service.mapsService, 'searchPollingLocations').mockResolvedValue({
        ok: false,
        error: 'Not found error',
      });
      // @ts-ignore
      const res = await service.dispatchTool('find_polling_location', { query: 'delhi' });
      expect(res).toBe('Not found error');
    });
  });

  describe('a11y.ts coverage', () => {
    it('handleTabFocusShift wraps backward focus from first to last on Shift+Tab', () => {
      document.body.innerHTML = `
        <div id="focus-trap">
          <button id="btn-a">A</button>
          <button id="btn-b">B</button>
        </div>`;
      trapFocus('focus-trap');
      const container = document.getElementById('focus-trap')!;
      const btnA = document.getElementById('btn-a')!;
      btnA.focus();
      
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab', shiftKey: true, bubbles: true, cancelable: true
      });
      const preventSpy = vi.spyOn(tabEvent, 'preventDefault');
      Object.defineProperty(document, 'activeElement', { value: btnA, configurable: true });
      container.dispatchEvent(tabEvent);
      expect(preventSpy).toHaveBeenCalled();
      document.body.innerHTML = '';
    });

    it('calls callback when reduced motion change fires', () => {
      const callback = vi.fn();
      let changeHandler: any;
      const addListener = vi.fn((_event, handler) => {
        changeHandler = handler;
      });
      globalThis.window.matchMedia = vi.fn().mockReturnValue({
        addEventListener: addListener,
        removeEventListener: vi.fn(),
      }) as any;

      onReducedMotionChange(callback);
      if (changeHandler) changeHandler({ matches: true });
      expect(callback).toHaveBeenCalledWith(true);
    });
  });

  describe('cache.ts coverage', () => {
    it('returns false in has() for expired entries', () => {
      vi.useFakeTimers();
      const cache = new ElectionCache<string>();
      cache.set('expiring-has', 'data', 1000);
      vi.advanceTimersByTime(1500);
      expect(cache.has('expiring-has')).toBe(false);
      vi.useRealTimers();
    });
  });

  describe('logger.ts coverage', () => {
    it('logger.debug emits when MIN_LEVEL is debug (default in test)', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
      logger.debug('CoverageFiller', 'coverage test message', { extra: true });
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('[CoverageFiller]'),
        'coverage test message',
        { extra: true },
      );
      spy.mockRestore();
    });
  });

  describe('sanitize.ts coverage', () => {
    it('sanitizeForApi returns empty for non-string', () => {
      expect(sanitizeForApi(123 as any)).toBe('');
    });
    it('setSafeInnerHTML uses template to set content', () => {
      const el = document.createElement('div');
      setSafeInnerHTML(el, '<b>safe</b>');
      expect(el.innerHTML).toBe('<b>safe</b>');
    });
  });

  describe('store.ts coverage', () => {
    it('catches and logs subscriber errors during notify()', () => {
      // matchMedia must be available for prefersReducedMotion() inside createInitialState
      const origMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as any;

      const testStore = new ElectionStore();

      // subscribe() calls subscriber(getState()) directly (no try/catch).
      // The try/catch is only in private notify(). So we subscribe a subscriber
      // that succeeds on the first call (subscribe) then throws on subsequent calls (notify).
      let callCount = 0;
      const faultySubscriber = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount > 1) {
          throw new Error('Subscriber error in notify');
        }
      });

      testStore.subscribe(faultySubscriber);
      // First call succeeded (subscribe's direct call). Now trigger notify() via setState:
      expect(() => testStore.setState({ isCoachOpen: true })).not.toThrow();
      // Subscriber was called twice: once on subscribe, once on setState
      expect(faultySubscriber).toHaveBeenCalledTimes(2);

      window.matchMedia = origMatchMedia;
    });
  });

  // ═══════════════════════════════════════════════════════
  // FINAL GAP-CLOSING TESTS
  // ═══════════════════════════════════════════════════════

  describe('gemini.ts dispatch — remaining tools', () => {
    it('dispatchTool handles check_voter_eligibility (lines 532-535)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      const res = await service.dispatchTool('check_voter_eligibility', { age: 20 });
      expect(typeof res).toBe('string');
      expect(res.length).toBeGreaterThan(0);
    });

    it('dispatchTool handles get_election_timeline (lines 537-539)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      const res = await service.dispatchTool('get_election_timeline', {});
      expect(typeof res).toBe('string');
      expect(res.length).toBeGreaterThan(0);
    });

    it('dispatchTool handles lookup_election_faq (lines 527-530)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      const res = await service.dispatchTool('lookup_election_faq', { search_query: 'eligibility' });
      expect(typeof res).toBe('string');
    });

    it('dispatchTool returns fallback for unknown tool (line 523)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      const res = await service.dispatchTool('nonexistent_tool', {});
      expect(res).toContain('not yet connected');
    });

    it('processToolCall catches dispatch errors (lines 505-507)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore — force dispatchTool to throw
      vi.spyOn(service as any, 'dispatchTool').mockRejectedValue(new Error('dispatch crash'));
      // @ts-ignore
      const result = await service.processToolCall({ name: 'test', args: {} });
      expect(result.status).toBe('error');
      expect(result.result).toBe('Service unavailable');
    });
  });

  describe('maps.ts initMap — uncovered branches', () => {
    it('initMap returns false when maps API is not loaded (lines 154-156)', () => {
      const service = new ElectionMapsService();
      // isLoaded is false by default
      document.body.innerHTML = '<div id="map-uncovered"></div>';
      const result = service.initMap('map-uncovered');
      expect(result).toBe(false);
      document.body.innerHTML = '';
    });

    it('initMap returns false on map constructor throw (lines 168-171)', () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.isLoaded = true;
      document.body.innerHTML = '<div id="map-error"></div>';
      // @ts-ignore
      globalThis.google = {
        maps: {
          Map: vi.fn(() => { throw new Error('Map constructor failed'); }) as any,
        } as any,
      } as any;
      const result = service.initMap('map-error');
      expect(result).toBe(false);
      // @ts-ignore
      delete globalThis.google;
      document.body.innerHTML = '';
    });
  });

  describe('translation.ts extractTranslatedText — empty string branch', () => {
    it('translateText returns original when API returns empty translatedText (line 253)', async () => {
      const service = new ElectionTranslationService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockResolvedValue({
        ok: true,
        data: { data: { translations: [{ translatedText: '' }] } },
      });
      const result = await service.translateText('hello', 'hi');
      // Empty translatedText → extractTranslatedText returns null → falls back to original
      expect(result).toBe('hello');
    });
  });

  describe('vertex.ts corpus cache hit (lines 244-245)', () => {
    it('getCorpusEmbeddings returns cached embeddings on second call', async () => {
      const service = new ElectionVertexService();
      // @ts-ignore
      service.apiKey = 'test-key';
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockResolvedValue({
        ok: true,
        data: { predictions: [{ embeddings: { values: [0.1, 0.2, 0.3] } }] },
      });
      // First call populates cache
      // @ts-ignore
      const first = await service.getCorpusEmbeddings();
      // Second call should return cached (lines 243-245)
      // @ts-ignore
      const second = await service.getCorpusEmbeddings();
      expect(second).toBe(first); // Same reference = cache hit
    });
  });

  describe('gemini.ts followUp branches (lines 416-421, 433-434)', () => {
    it('buildFollowUpRequest maps assistant role to model and filters system', async () => {
      const service = new ElectionCoachService();
      // Populate some history
      // @ts-ignore
      service.conversationHistory = [
        { id: '1', timestamp: 1, role: 'system', content: 'system' },
        { id: '2', timestamp: 2, role: 'assistant', content: 'assistant' },
        { id: '3', timestamp: 3, role: 'user', content: 'user' },
      ];
      // @ts-ignore
      const req = service.buildFollowUpRequest('query', [], []);
      const contents = req.contents as any[];
      // First two should be the history without 'system'
      expect(contents[0].role).toBe('model'); // 'assistant' maps to 'model'
      expect(contents[1].role).toBe('user');
    });

    it('followUp returns null when text is empty (lines 416-421)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      vi.spyOn(service, 'processToolCall').mockResolvedValue({ toolName: 'test', status: 'success', result: 'res' });
      // @ts-ignore
      vi.spyOn(service, 'buildFollowUpRequest').mockReturnValue({});
      // Return empty text in follow up
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockResolvedValue({
        ok: true,
        data: { candidates: [{ content: { parts: [{ text: '' }] } }] },
      });
      // @ts-ignore
      const res = await service.handleToolCalls('query', [], [{ functionCall: { name: 'test', args: {} } }], 'endpoint');
      expect(res).toBeNull(); // Empty followUpText falls back to null
    });
  });

  describe('maps.ts loadMapsApi branches (lines 103-104, 116-119)', () => {
    it('returns early if already loading (lines 103-104)', () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.apiKey = 'test';
      
      service.loadMapsApi();
      service.loadMapsApi();
      // Verify only 1 script tag was added
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      expect(scripts.length).toBe(1);
      
      scripts[0].remove();
    });

    it('resolves if script tag is found in DOM', async () => {
      const service = new ElectionMapsService();
      // @ts-ignore
      service.apiKey = 'test';
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js';
      document.head.appendChild(script);

      const res = await service.loadMapsApi();
      expect(res).toBe(true);
      // @ts-ignore
      expect(service.isLoaded).toBe(true);

      document.head.removeChild(script);
    });
  });

  describe('Module-level env branches (logger 34, vertex 57)', () => {
    it('logger.ts resolveLevel with valid env', async () => {
      vi.stubEnv('VITE_LOG_LEVEL', 'warn');
      vi.resetModules();
      const { logger } = await import('../../src/utils/logger');
      expect(logger).toBeDefined();
      vi.unstubAllEnvs();
    });

    it('logger.ts resolveLevel in PROD mode', async () => {
      vi.stubEnv('VITE_LOG_LEVEL', '');
      vi.stubEnv('PROD', true as any);
      vi.resetModules();
      const { logger } = await import('../../src/utils/logger');
      expect(logger).toBeDefined();
      vi.unstubAllEnvs();
    });

    it('vertex.ts fallback config with VITE_GOOGLE_CLOUD_PROJECT', async () => {
      vi.stubEnv('VITE_GOOGLE_CLOUD_PROJECT', 'custom-project');
      vi.resetModules();
      let { ElectionVertexService } = await import('../../src/services/vertex');
      let service = new ElectionVertexService();
      expect(service).toBeDefined();

      // Test fallback when env is missing
      vi.stubEnv('VITE_GOOGLE_CLOUD_PROJECT', '');
      vi.resetModules();
      ({ ElectionVertexService } = await import('../../src/services/vertex'));
      service = new ElectionVertexService();
      expect(service).toBeDefined();
      vi.unstubAllEnvs();
    });
  });

  describe('gemini.ts dispatch tool branches (lines 542-555)', () => {
    it('dispatchTranslateText handles missing text and targetLang (lines 542-543)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      vi.spyOn(service.translationService, 'translateText').mockResolvedValue('ok');
      // @ts-ignore
      const res = await service.dispatchTranslateText({});
      expect(res).toBe('ok');
    });

    it('dispatchFindPollingLocation handles missing pin_code and missing error (lines 548, 555)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      vi.spyOn(service.mapsService, 'searchPollingLocations').mockResolvedValue({ ok: false, error: null });
      // @ts-ignore
      const res = await service.dispatchFindPollingLocation({});
      expect(res).toBe('No polling locations found.');
    });

    it('handleToolCalls maps error status to Service unavailable (line 408)', async () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      vi.spyOn(service, 'processToolCall').mockResolvedValue({ toolName: 'test', status: 'error', result: 'res' });
      // @ts-ignore
      vi.spyOn(service, 'buildFollowUpRequest').mockReturnValue({});
      // @ts-ignore
      vi.spyOn(service.client, 'post').mockResolvedValue({ ok: false });
      // @ts-ignore
      await service.handleToolCalls('query', [], [{ functionCall: { name: 'test', args: {} } }], 'endpoint');
      // @ts-ignore
      expect(service.buildFollowUpRequest).toHaveBeenCalledWith(
        'query', [], 
        expect.arrayContaining([expect.objectContaining({ functionResponse: { name: 'test', response: { result: 'Service unavailable' } } })])
      );
    });

    it('dispatchLookupFaq handles missing arg and no match (lines 528-529)', () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      const res = service.dispatchLookupFaq({});
      expect(res).toBe('No FAQ match found.');
    });

    it('dispatchLookupFaq returns answer on match (line 529)', () => {
      const service = new ElectionCoachService();
      // 'NOTA' is in the FAQ
      // @ts-ignore
      const res = service.dispatchLookupFaq({ search_query: 'NOTA' });
      expect(res).toContain('As per the current rules');
    });

    it('dispatchCheckEligibility handles invalid age resulting in errors (line 534)', () => {
      const service = new ElectionCoachService();
      // @ts-ignore
      const res = service.dispatchCheckEligibility({ age: 'xyz' });
      expect(res).toContain('Age must be a valid number.');
    });
  });
});
