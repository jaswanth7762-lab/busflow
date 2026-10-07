// src/lib/storage.ts
/**
 * Simple wrapper around localStorage with versioned keys.
 * All data is stored under the prefix `busflow_v1_`.
 */
const PREFIX = 'busflow_v1_';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) return JSON.parse(raw) as T;
  } catch (e) {
    // ignore parse errors
  }
  return fallback;
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    // ignore storage quota errors
  }
}

export function clearAll() {
  // Remove all keys that start with the prefix
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith(PREFIX)) localStorage.removeItem(k);
  });
}
