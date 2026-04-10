/**
 * API utilities for rate limiting, caching, and retry logic
 */

// Cache configuration
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MIN_REQUEST_INTERVAL_MS = 10 * 1000; // Minimum 10 seconds between requests

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface RateLimitState {
  lastRequestTime: number;
  retryAfter: number | null;
  isRateLimited: boolean;
}

// In-memory cache (client-side)
const cache = new Map<string, CacheEntry<unknown>>();
const rateLimitState: RateLimitState = {
  lastRequestTime: 0,
  retryAfter: null,
  isRateLimited: false,
};

/**
 * Get cached data if still valid
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cache with expiration
 */
export function setCache<T>(key: string, data: T, durationMs = CACHE_DURATION_MS): void {
  const now = Date.now();
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + durationMs,
  });
}

/**
 * Clear specific cache entry or all entries
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Check if we should throttle requests
 */
export function shouldThrottle(): { throttle: boolean; waitMs: number } {
  const now = Date.now();

  // Check if we're in a rate-limited state
  if (rateLimitState.isRateLimited && rateLimitState.retryAfter) {
    const waitMs = rateLimitState.retryAfter - now;
    if (waitMs > 0) {
      return { throttle: true, waitMs };
    }
    // Rate limit period has passed
    rateLimitState.isRateLimited = false;
    rateLimitState.retryAfter = null;
  }

  // Check minimum interval between requests
  const timeSinceLastRequest = now - rateLimitState.lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    return { throttle: true, waitMs: MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest };
  }

  return { throttle: false, waitMs: 0 };
}

/**
 * Record that a request was made
 */
export function recordRequest(): void {
  rateLimitState.lastRequestTime = Date.now();
}

/**
 * Handle rate limit response
 */
export function handleRateLimitResponse(retryAfterSeconds?: number): void {
  const now = Date.now();
  rateLimitState.isRateLimited = true;
  // Default to 15 minutes if no Retry-After header
  const waitMs = (retryAfterSeconds ?? 900) * 1000;
  rateLimitState.retryAfter = now + waitMs;
}

/**
 * Get rate limit status for UI display
 */
export function getRateLimitStatus(): {
  isLimited: boolean;
  retryInSeconds: number | null;
} {
  if (!rateLimitState.isRateLimited || !rateLimitState.retryAfter) {
    return { isLimited: false, retryInSeconds: null };
  }

  const waitMs = rateLimitState.retryAfter - Date.now();
  if (waitMs <= 0) {
    rateLimitState.isRateLimited = false;
    rateLimitState.retryAfter = null;
    return { isLimited: false, retryInSeconds: null };
  }

  return { isLimited: true, retryInSeconds: Math.ceil(waitMs / 1000) };
}

/**
 * Clear rate limit state (useful for manual reset or testing)
 */
export function clearRateLimitState(): void {
  rateLimitState.isRateLimited = false;
  rateLimitState.retryAfter = null;
  rateLimitState.lastRequestTime = 0;
}

/**
 * Fetch with retry and exponential backoff
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  config?: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    cacheKey?: string;
    cacheDurationMs?: number;
  }
): Promise<{ data: T | null; error: string | null; fromCache: boolean; rateLimited: boolean }> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    cacheKey,
    cacheDurationMs = CACHE_DURATION_MS,
  } = config ?? {};

  // Check cache first
  if (cacheKey) {
    const cached = getCached<T>(cacheKey);
    if (cached) {
      return { data: cached, error: null, fromCache: true, rateLimited: false };
    }
  }

  // Check throttling
  const throttleCheck = shouldThrottle();
  if (throttleCheck.throttle) {
    const status = getRateLimitStatus();
    if (status.isLimited) {
      return {
        data: null,
        error: `Rate limited. Please wait ${status.retryInSeconds} seconds before retrying.`,
        fromCache: false,
        rateLimited: true,
      };
    }
    // Wait for minimum interval
    await new Promise((resolve) => setTimeout(resolve, throttleCheck.waitMs));
  }

  let lastError: string | null = null;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      recordRequest();
      const response = await fetch(url, options);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
        handleRateLimitResponse(retryAfterSeconds);

        const errorData = await response.json().catch(() => ({}));
        return {
          data: null,
          error: errorData.error || 'Rate limited by Strava. Please wait before trying again.',
          fromCache: false,
          rateLimited: true,
        };
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Don't retry 401 errors
        if (response.status === 401) {
          return {
            data: null,
            error: errorData.error || 'Authentication failed',
            fromCache: false,
            rateLimited: false,
          };
        }

        lastError = errorData.error || `Request failed with status ${response.status}`;

        // Don't retry on the last attempt
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay = Math.min(delay * 2, maxDelayMs);
          continue;
        }
      }

      const data = await response.json() as T;

      // Cache successful response
      if (cacheKey) {
        setCache(cacheKey, data, cacheDurationMs);
      }

      return { data, error: null, fromCache: false, rateLimited: false };
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Network error';

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, maxDelayMs);
      }
    }
  }

  return { data: null, error: lastError, fromCache: false, rateLimited: false };
}

/**
 * Format rate limit info for display
 */
export function formatRateLimitInfo(limit: string | null, usage: string | null): string | null {
  if (!limit || !usage) return null;

  // Strava format: "limit1,limit2" and "usage1,usage2"
  // limit1/usage1 = 15-minute window, limit2/usage2 = daily window
  const limits = limit.split(',').map(Number);
  const usages = usage.split(',').map(Number);

  if (limits.length >= 2 && usages.length >= 2) {
    const fifteenMinRemaining = limits[0] - usages[0];
    const dailyRemaining = limits[1] - usages[1];
    return `API calls remaining: ${fifteenMinRemaining} (15min) / ${dailyRemaining} (daily)`;
  }

  return null;
}
