'use client';

// Exported so the admin settings page can write to the same key after a
// save (instant same-tab echo for TrackingScripts/PromoBar) without the
// two copies of this string drifting apart.
export const SETTINGS_CACHE_KEY = 'lumiflick_store_settings_v2';
const FRAME_CACHE_KEY = 'lumiflick_frame_settings_v1';

let pendingSettingsPromise: Promise<any> | null = null;
let pendingFramePromise: Promise<any> | null = null;

// Lite store settings: tracking scripts, promo bar lines, contact/delivery
// info. Hits /api/store-settings, which is deliberately column-limited —
// it excludes the two frame-effect base64 images (~150KB combined) that
// used to ride along on this fetch and got paid for on every single page
// load. Those live behind fetchFrameSettings() below instead, loaded only
// by the homepage slider that actually needs them.
export async function fetchStoreSettings(force = false): Promise<any | null> {
  if (typeof window === 'undefined') return null;

  // 1. If not forcing and a request is already in-flight, return the shared promise
  if (!force && pendingSettingsPromise) {
    return pendingSettingsPromise;
  }

  // 2. Fetch and share the single promise
  pendingSettingsPromise = (async () => {
    try {
      const res = await fetch('/api/store-settings');
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

// Frame-effect before/after images for the homepage slider — split out from
// the settings above because they're ~150KB of base64 each and only one
// component on one page needs them. Same in-flight-dedupe + localStorage
// pattern as fetchStoreSettings, just against /api/store-settings/frame.
export async function fetchFrameSettings(force = false): Promise<any | null> {
  if (typeof window === 'undefined') return null;

  if (!force && pendingFramePromise) {
    return pendingFramePromise;
  }

  pendingFramePromise = (async () => {
    try {
      const res = await fetch('/api/store-settings/frame');
      const data = await res.json();
      if (data && data.success && data.settings) {
        try {
          localStorage.setItem(FRAME_CACHE_KEY, JSON.stringify(data.settings));
        } catch {}
        return data.settings;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch frame settings:', err);
      return null;
    } finally {
      setTimeout(() => {
        pendingFramePromise = null;
      }, 5000);
    }
  })();

  return pendingFramePromise;
}

export function getCachedFrameSettings(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(FRAME_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
