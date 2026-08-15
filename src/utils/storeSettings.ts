'use client';

const SETTINGS_CACHE_KEY = 'lumiflick_store_settings_v1';

let pendingSettingsPromise: Promise<any> | null = null;

export async function fetchStoreSettings(force = false): Promise<any | null> {
  if (typeof window === 'undefined') return null;

  // 1. If not forcing and a request is already in-flight, return the shared promise
  if (!force && pendingSettingsPromise) {
    return pendingSettingsPromise;
  }

  // 2. Fetch and share the single promise
  pendingSettingsPromise = (async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data && data.success && data.settings) {
        try {
          localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(data.settings));
        } catch {}
        return data.settings;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch store settings:', err);
      return null;
    } finally {
      // Clear after completion so future updates can re-fetch
      setTimeout(() => {
        pendingSettingsPromise = null;
      }, 5000);
    }
  })();

  return pendingSettingsPromise;
}

export function getCachedStoreSettings(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
