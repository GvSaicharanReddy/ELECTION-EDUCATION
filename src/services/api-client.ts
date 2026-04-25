/**
 * Safe Fetch Wrapper — Centralised HTTP client with security defaults.
 *
 * All external API calls go through this module for consistent
 * timeout handling, error boundaries, and response sanitization.
 *
 * @module services/api-client
 */

import { ApiResponse, FetchConfig } from '../types/index';

/** Default configuration for API calls. */
const DEFAULT_CONFIG: FetchConfig = {
  baseUrl: '',
  timeoutMs: 15000,
  retries: 1,
};

/**
 * Create a fetch request with timeout and abort support.
 *
 * @param url - Full URL to fetch.
 * @param options - Standard fetch options.
 * @param timeoutMs - Timeout in milliseconds.
 * @returns Fetch response or throws on timeout.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Safe API client with retry logic, timeout, and typed responses.
 *
 * Wraps fetch with consistent error handling and never leaks
 * stack traces or internal details to the caller.
 */
export class SafeApiClient {
  private readonly config: FetchConfig;

  /**
   * Create a new API client.
   *
   * @param config - Client configuration.
   */
  constructor(config: Partial<FetchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Perform a GET request.
   *
   * @param path - URL path (appended to baseUrl).
   * @param headers - Additional headers.
   * @returns Typed API response.
   */
  async get<T>(path: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET', headers });
  }

  /**
   * Perform a POST request with JSON body.
   *
   * @param path - URL path.
   * @param body - Request body (will be JSON-serialised).
   * @param headers - Additional headers.
   * @returns Typed API response.
   */
  async post<T>(
    path: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Core request method with retry and error handling.
   *
   * @param path - URL path.
   * @param options - Fetch options.
   * @returns Typed API response wrapper.
   */
  private async request<T>(
    path: string,
    options: RequestInit,
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${path}`;
    const maxRetries = this.config.retries ?? 1;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetchWithTimeout(
          url,
          {
            ...options,
            headers: {
              ...this.config.headers,
              ...(options.headers as Record<string, string>),
            },
          },
          this.config.timeoutMs,
        );

        if (!response.ok) {
          return {
            ok: false,
            data: null,
            error: `Request failed with status ${response.status}`,
            status: response.status,
          };
        }

        const data = (await response.json()) as T;
        return { ok: true, data, error: null, status: response.status };
      } catch (error: unknown) {
        const isLastAttempt = attempt === maxRetries;
        if (isLastAttempt) {
          const message =
            error instanceof Error ? error.message : 'Unknown network error';
          const isTimeout = message.includes('abort');
          return {
            ok: false,
            data: null,
            error: isTimeout
              ? 'Request timed out. Please check your connection.'
              : 'Network error. Please try again later.',
            status: 0,
          };
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 500),
        );
      }
    }

    return {
      ok: false,
      data: null,
      error: 'Max retries exceeded.',
      status: 0,
    };
  }
}

/**
 * Pre-configured API client for Google APIs.
 * Uses environment variables for configuration.
 */
export function createGoogleApiClient(): SafeApiClient {
  return new SafeApiClient({
    baseUrl: 'https://generativelanguage.googleapis.com',
    timeoutMs: 30000,
    retries: 2,
  });
}
