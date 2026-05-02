import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ElectionMapsService } from '../../src/services/maps';
import { ElectionCoachService } from '../../src/services/gemini';

describe('ElectionMapsService — Deep Coverage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');
    vi.stubEnv('VITE_GEMINI_API_KEY', 'gemini-key');

    // Mock Google Maps API
    (globalThis as any).google = {
      maps: {
        Map: vi.fn(),
        marker: {
          AdvancedMarkerElement: vi.fn(),
        },
        places: {
          PlacesService: vi.fn().mockImplementation(() => ({
            textSearch: vi.fn((request, callback) => {
              if (request.query.includes('fail-denied')) {
                callback(null, 'REQUEST_DENIED');
              } else if (request.query.includes('fail-zero')) {
                callback([], 'ZERO_RESULTS');
              } else if (request.query.includes('fail-other')) {
                callback(null, 'UNKNOWN_ERROR');
              } else {
                callback([
                  {
                    name: 'Test Polling Booth',
                    formatted_address: '123 Main St',
                    geometry: {
                      location: {
                        lat: () => 12.34,
                        lng: () => 56.78
                      }
                    }
                  }
                ], 'OK');
              }
            })
          })),
          PlacesServiceStatus: {
            OK: 'OK',
            REQUEST_DENIED: 'REQUEST_DENIED',
            ZERO_RESULTS: 'ZERO_RESULTS'
          }
        }
      }
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete (globalThis as any).google;
  });

  it('searchPollingLocations with Places API - OK', async () => {
    const service = new ElectionMapsService();
    // Force isLoaded and mapInstance to true/mock
    (service as any).isLoaded = true;
    (service as any).mapInstance = {};

    const result = await service.searchPollingLocations('Mumbai');
    expect(result.ok).toBe(true);
    expect(result.data?.[0].name).toBe('Test Polling Booth');
  });

  it('searchPollingLocations with Places API - REQUEST_DENIED', async () => {
    const service = new ElectionMapsService();
    (service as any).isLoaded = true;
    (service as any).mapInstance = {};

    const result = await service.searchPollingLocations('fail-denied');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Request Denied');
  });

  it('searchPollingLocations with Places API - ZERO_RESULTS', async () => {
    const service = new ElectionMapsService();
    (service as any).isLoaded = true;
    (service as any).mapInstance = {};

    const result = await service.searchPollingLocations('fail-zero');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('No polling locations found');
  });

  it('searchPollingLocations with Places API - OTHER ERROR', async () => {
    const service = new ElectionMapsService();
    (service as any).isLoaded = true;
    (service as any).mapInstance = {};

    const result = await service.searchPollingLocations('fail-other');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('UNKNOWN_ERROR');
  });
});

describe('ElectionCoachService — Deep Coverage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('callGeminiApi handles valid response with text', async () => {
    const service = new ElectionCoachService();
    // mock fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        candidates: [
          {
            content: {
              parts: [{ text: 'Here is some advice.' }],
              role: 'model'
            }
          }
        ]
      })
    });
    
    // Clear history
    service.clearHistory();

    const response = await service.chat('How to vote?');
    expect(response.content).toBe('Here is some advice.');
    expect(service.getHistory().length).toBe(2);
  });

  it('callGeminiApi handles invalid API response (no candidates)', async () => {
    const service = new ElectionCoachService();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({})
    });

    const response = await service.chat('How to vote?');
    // Should fallback to static
    expect(response.content).toContain('Welcome to Election Saathi India');
  });

  it('callGeminiApi handles tool calls', async () => {
    const service = new ElectionCoachService();

    // First call: Gemini returns a tool call
    // Second call (follow-up with tool result): Gemini returns final text
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [
                  { text: 'I am checking that for you.' },
                  { functionCall: { name: 'find_polling_location', args: { query: 'Mumbai' } } },
                ],
                role: 'model',
              },
            }],
          }),
        });
      }
      // Follow-up response after tool result
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'Your nearest polling booth in Mumbai is at XYZ.' }],
              role: 'model',
            },
          }],
        }),
      });
    });

    const response = await service.chat('Where to vote in Mumbai?');
    expect(response.content).toContain('Mumbai');
  });
});
