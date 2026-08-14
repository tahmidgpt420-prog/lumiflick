'use client';

import React, { useEffect, useState } from 'react';

interface PromoBarItem {
  icon: string;
  text: string;
}

const DEFAULT_ITEMS: PromoBarItem[] = [
  { icon: '🎁', text: 'Upto 35% Off— Biggest Sale of the Year' },
  { icon: '💳', text: 'Cash on Delivery Available' },
  { icon: '🚚', text: 'Fast Delivery All Over Bangladesh' },
];

export default function PromoBar() {
  // Start from the browser cache (same store used by the settings page /
  // TrackingScripts) so there's no flash of default content on repeat
  // visits, then reconcile with a fresh fetch.
  const [items, setItems] = useState<PromoBarItem[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_ITEMS;
    try {
      const cached = localStorage.getItem('lumiflick_store_settings_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.promoBarItems)) return parsed.promoBarItems;
      }
    } catch {
      // fall through to defaults
    }
    return DEFAULT_ITEMS;
  });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.settings?.promoBarItems)) {
          setItems(data.settings.promoBarItems);
        }
      } catch (err) {
        console.error('Failed to load promo bar items:', err);
      }
    }

    const handleSettingsUpdate = () => {
      try {
        const cached = localStorage.getItem('lumiflick_store_settings_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed?.promoBarItems)) setItems(parsed.promoBarItems);
        }
      } catch {
        // ignore
      }
      load();
    };

    window.addEventListener('lumiflick_settings_updated', handleSettingsUpdate);
    load();

    return () => {
      isMounted = false;
      window.removeEventListener('lumiflick_settings_updated', handleSettingsUpdate);
    };
  }, []);

  // Admin cleared every line — hide the bar rather than show an empty strip.
  if (items.length === 0) return null;

  // Duplicate items within each track half so it comfortably spans any screen width
  const repeatCount = items.length <= 2 ? 3 : items.length <= 4 ? 2 : 1;
  const trackItems = Array(repeatCount).fill(items).flat();

  return (
    <div className="velmora-promo-banner" role="banner" aria-label="Promotional offers">
      <div className="velmora-promo-marquee">
        {/* Track A */}
        <div className="velmora-promo-track">
          {trackItems.map((item, idx) => (
            <React.Fragment key={`a-${idx}`}>
              <div className="velmora-promo-item">
                <span className="text-base" aria-hidden="true">{item.icon}</span>
                <span>{item.text}</span>
              </div>
              <span className="velmora-promo-separator" aria-hidden="true" />
            </React.Fragment>
          ))}
        </div>

        {/* Track B (Identical duplicate for seamless infinite loop without restarting jump) */}
        <div className="velmora-promo-track" aria-hidden="true">
          {trackItems.map((item, idx) => (
            <React.Fragment key={`b-${idx}`}>
              <div className="velmora-promo-item">
                <span className="text-base" aria-hidden="true">{item.icon}</span>
                <span>{item.text}</span>
              </div>
              <span className="velmora-promo-separator" aria-hidden="true" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
