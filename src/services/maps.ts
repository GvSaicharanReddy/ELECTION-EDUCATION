/**
 * Google Maps Integration — Polling location assistance.
 *
 * Provides location-aware election help: finding polling booths,
 * election offices, voter registration centres, and civic resources.
 *
 * @module services/maps
 */

/// <reference types="@types/google.maps" />

import { PollingLocation, ApiResponse } from '../types/index';
import { sanitizeForApi } from '../utils/sanitize';
import { ElectionCache, makeCacheKey } from '../utils/cache';
import { logger } from '../utils/logger';

/** Default map centre — New Delhi (India Gate), latitude. */
const INDIA_CENTRE_LAT = 28.6139;

/** Default map centre — New Delhi (India Gate), longitude. */
const INDIA_CENTRE_LNG = 77.209;

/** Default map centre — New Delhi (India Gate). */
const INDIA_CENTRE = { lat: INDIA_CENTRE_LAT, lng: INDIA_CENTRE_LNG };

/** Default zoom level for city-level view. */
const DEFAULT_ZOOM = 12;

/** Maximum number of place results to return. */
const MAX_PLACE_RESULTS = 5;

/** Cache TTL for map results in milliseconds (30 minutes). */
const MAPS_CACHE_TTL_MS = 1800000;

/** Maximum cache entries for map results. */
const MAPS_MAX_CACHE_ENTRIES = 20;

/** Geolocation timeout in milliseconds (10 seconds). */
const GEO_TIMEOUT_MS = 10000;

/** Maximum age for cached geolocation position in milliseconds (5 minutes). */
const GEO_MAX_AGE_MS = 300000;

/** HTTP OK status code. */
const HTTP_OK = 200;

/** Maximum length for maps search queries. */
const MAPS_INPUT_MAX_LENGTH = 200;

/**
 * Google Maps service for election-related location assistance.
 *
 * Manages map rendering, place search, and polling location display.
 * Falls back to a static embed or text-based location info when the
 * Maps JavaScript API is unavailable.
 */
export class ElectionMapsService {
  private readonly apiKey: string;
  private readonly cache: ElectionCache<PollingLocation[]>;
  private mapInstance: google.maps.Map | null;
  private isLoaded: boolean;
  private mapsPromise: Promise<boolean> | null = null;

  /**
   * Initialize the Google Maps Service.
   */
  constructor() {
    this.apiKey = String(
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    );
    this.cache = new ElectionCache<PollingLocation[]>({
      defaultTtlMs: MAPS_CACHE_TTL_MS,
      maxEntries: MAPS_MAX_CACHE_ENTRIES,
    });
    this.mapInstance = null;
    this.isLoaded = false;
  }

  /**
   * Check if Google Maps API key is configured.
   *
   * @returns True if an API key is present.
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Load the Google Maps JavaScript API dynamically.
   *
   * @returns True if the API loaded successfully.
   */
  async loadMapsApi(): Promise<boolean> {
    if (this.isLoaded) {
      return true;
    }

    if (!this.isConfigured()) {
      return false;
    }

    if (this.mapsPromise) {
      return this.mapsPromise;
    }

    this.mapsPromise = new Promise((resolve) => {
      // Check if already loaded by another script
      if (typeof google !== 'undefined' && google.maps) {
        this.isLoaded = true;
        resolve(true);
        return;
      }

      const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existing) {
        this.isLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,marker&v=weekly`;
      script.async = true;
      script.defer = true;

      script.onload = (): void => {
        this.isLoaded = true;
        resolve(true);
      };

      script.onerror = (): void => {
        this.mapsPromise = null;
        resolve(false);
      };

      document.head.appendChild(script);
    });
    return this.mapsPromise;
  }

  /**
   * Initialise a Google Map in the specified container element.
   *
   * @param containerId - ID of the HTML element to host the map.
   * @param centre - Optional centre coordinates.
   * @param zoom - Optional zoom level.
   * @returns True if the map was initialised.
   */
  initMap(containerId: string, centre: { lat: number; lng: number } = INDIA_CENTRE, zoom: number = DEFAULT_ZOOM): boolean {
    const container = document.getElementById(containerId);
    if (!container) {
      return false;
    }
    if (!this.isLoaded) {
      return false;
    }

    try {
      this.mapInstance = new google.maps.Map(container, {
        center: centre,
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      return true;
    } catch (err) {
      logger.warn('ElectionMapsService', 'Map init failed', err);
      return false;
    }
  }

  /**
   * Search for polling-related locations near a given query.
   *
   * @param query - Search query (e.g., "polling booth near Andheri Mumbai").
   * @returns Array of matching polling locations.
   */
  async searchPollingLocations(query: string): Promise<ApiResponse<PollingLocation[]>> {
    const sanitised = sanitizeForApi(query, MAPS_INPUT_MAX_LENGTH);
    const cacheKey = makeCacheKey('maps', sanitised.toLowerCase());

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ok: true, data: cached, error: null, status: HTTP_OK };
    }

    // If Maps API is loaded and map exists, use Places API
    if (this.isLoaded && this.mapInstance) {
      return this.searchWithPlacesApi(sanitised, cacheKey);
    }

    // Fallback: return sample locations
    const fallback = this.getFallbackLocations(sanitised);
    return { ok: true, data: fallback, error: null, status: HTTP_OK };
  }

  /**
   * Search using the Google Places API.
   *
   * @param query - Sanitised search query.
   * @param cacheKey - Key for caching results.
   * @returns API response with locations.
   */
  private async searchWithPlacesApi(
    query: string,
    cacheKey: string,
  ): Promise<ApiResponse<PollingLocation[]>> {
    if (!this.mapInstance) {
      return { ok: false, data: null, error: 'Map not initialised', status: 0 };
    }

    return new Promise((resolve) => {
      const service = new google.maps.places.PlacesService(this.mapInstance!);

      const request: google.maps.places.TextSearchRequest = {
        query: `${query} election office polling booth India`,
        region: 'in',
      };

      service.textSearch(request, (results, status) => {
        resolve(this.processPlacesResponse(status, results, cacheKey));
      });
    });
  }

  /**
   * Process the response from Google Places API.
   */
  private processPlacesResponse(
    status: google.maps.places.PlacesServiceStatus | string,
    results: google.maps.places.PlaceResult[] | null,
    cacheKey: string,
  ): ApiResponse<PollingLocation[]> {
    if (String(status) !== String(google.maps.places.PlacesServiceStatus.OK) || !results) {
      let errorMsg = 'No locations found. Try a different search.';
      if (String(status) === String(google.maps.places.PlacesServiceStatus.REQUEST_DENIED)) {
        errorMsg =
          'Google Maps API Error: Request Denied. Your API key might be invalid or not enabled for the Places API.';
      } else if (String(status) === String(google.maps.places.PlacesServiceStatus.ZERO_RESULTS)) {
        errorMsg = 'No polling locations found for this area. Try a broader search.';
      } else {
        errorMsg = `Google Maps Error: ${status}`;
      }
      return { ok: false, data: null, error: errorMsg, status: 0 };
    }

    const locations: PollingLocation[] = results.slice(0, MAX_PLACE_RESULTS).map((place) => ({
      name: place.name ?? 'Unknown Location',
      address: place.formatted_address ?? 'Address unavailable',
      latitude: place.geometry?.location?.lat() ?? 0,
      longitude: place.geometry?.location?.lng() ?? 0,
    }));

    this.cache.set(cacheKey, locations);
    this.addMarkersToMap(locations);

    return { ok: true, data: locations, error: null, status: HTTP_OK };
  }

  /**
   * Add AdvancedMarkerElements to the map for given locations.
   */
  private addMarkersToMap(locations: PollingLocation[]): void {
    locations.forEach((loc) => {
      if (this.mapInstance) {
        const markerEl = document.createElement('div');
        markerEl.textContent = '📍';
        markerEl.title = loc.name;
        new google.maps.marker.AdvancedMarkerElement({
          position: { lat: loc.latitude, lng: loc.longitude },
          map: this.mapInstance,
          title: loc.name,
          content: markerEl,
        });
      }
    });
  }

  /**
   * Generate a Google Maps embed URL for a location.
   *
   * Used as a lightweight fallback when the full Maps JS API is unavailable.
   *
   * @param query - Location search query.
   * @returns Google Maps embed URL.
   */
  generateMapsEmbedUrl(query: string): string {
    const sanitised = sanitizeForApi(query, MAPS_INPUT_MAX_LENGTH);
    const encoded = encodeURIComponent(`${sanitised} election office India`);

    if (this.apiKey) {
      return `https://www.google.com/maps/embed/v1/search?key=${this.apiKey}&q=${encoded}&region=in`;
    }

    // No-key fallback: link to Google Maps search
    return `https://www.google.com/maps/search/${encoded}`;
  }

  /**
   * Generate a direct Google Maps search link.
   *
   * @param query - Search query.
   * @returns Google Maps URL that opens in a new tab.
   */
  generateMapsLink(query: string): string {
    const sanitised = sanitizeForApi(query, MAPS_INPUT_MAX_LENGTH);
    return `https://www.google.com/maps/search/${encodeURIComponent(sanitised + ' election office India')}`;
  }

  /**
   * Provide fallback sample locations when Maps API is unavailable.
   *
   * @param _query - Search query (used for context).
   * @returns Array of sample polling locations.
   */
  private getFallbackLocations(_query: string): PollingLocation[] {
    return [
      {
        name: 'District Election Office',
        address: 'District Collectorate, your nearest district headquarters',
        latitude: 28.6139,
        longitude: 77.209,
        constituency: 'Check with your local BLO',
        state: 'Your State',
      },
      {
        name: 'Voter Registration Centre (NVSP)',
        address: 'Visit nvsp.in to find your nearest centre or call 1950',
        latitude: 28.6129,
        longitude: 77.2295,
      },
      {
        name: 'Booth Level Officer (BLO)',
        address: 'Contact your BLO through the Voter Helpline App or call 1950',
        latitude: 28.6353,
        longitude: 77.225,
      },
    ];
  }

  /**
   * Get the user's current geolocation.
   *
   * @returns Promise resolving to coordinates or null.
   */
  async getUserLocation(): Promise<{ lat: number; lng: number } | null> {
    if (!navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          resolve(null);
        },
        { timeout: GEO_TIMEOUT_MS, maximumAge: GEO_MAX_AGE_MS },
      );
    });
  }
}
