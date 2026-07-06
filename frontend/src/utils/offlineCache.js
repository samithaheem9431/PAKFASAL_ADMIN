/**
 * Lightweight offline cache for read-only list data (Learning module: crops,
 * pests/diseases, articles). Data fetched from the API is mirrored into
 * localStorage so the admin panel can still show the last known data when
 * the network request fails (e.g. device is offline).
 */

const CACHE_PREFIX = "pakfasal_cache:";

export function saveToCache(key, data) {
  try {
    const payload = { data, cachedAt: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded, etc.) — ignore.
  }
}

export function loadFromCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("data" in parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // ignore
  }
}

export function formatCacheTimestamp(cachedAt) {
  if (!cachedAt) return "";
  return new Date(cachedAt).toLocaleString();
}

/**
 * Runs `fetcher`, caching the result under `key` on success. If `fetcher`
 * throws (e.g. offline / network error), falls back to the last cached
 * value for `key` when available, otherwise re-throws the original error.
 */
export async function fetchWithCache(key, fetcher) {
  try {
    const data = await fetcher();
    saveToCache(key, data);
    return { data, fromCache: false, cachedAt: null };
  } catch (err) {
    const cached = loadFromCache(key);
    if (cached) {
      return { data: cached.data, fromCache: true, cachedAt: cached.cachedAt };
    }
    throw err;
  }
}
