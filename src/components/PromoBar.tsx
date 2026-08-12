'use client';

import React from 'react';

export default function PromoBar() {
  return (
    <div className="velmora-promo-banner" role="banner" aria-label="Promotional offers">
      <div className="velmora-promo-track">
        {/* Set 1 */}
        <div className="velmora-promo-item">
          <span className="text-base" aria-hidden="true">🎁</span>
          <span>Upto 35% Off— Biggest Sale of the Year</span>
        </div>
        <span className="velmora-promo-separator" aria-hidden="true"></span>
        <div className="velmora-promo-item">
          <span className="text-base" aria-hidden="true">💳</span>
          <span>Cash on Delivery Available</span>
        </div>
        <span className="velmora-promo-separator" aria-hidden="true"></span>
        <div className="velmora-promo-item">
          <span className="text-base" aria-hidden="true">🚚</span>
          <span>Fast Delivery All Over Bangladesh</span>
        </div>
        <span className="velmora-promo-separator" aria-hidden="true"></span>

        {/* Set 2 for seamless loop */}
        <div className="velmora-promo-item">
          <span className="text-base" aria-hidden="true">🎁</span>
          <span>Upto 35% Off— Biggest Sale of the Year</span>
        </div>
        <span className="velmora-promo-separator" aria-hidden="true"></span>
        <div className="velmora-promo-item">
          <span className="text-base" aria-hidden="true">💳</span>
          <span>Cash on Delivery Available</span>
        </div>
        <span className="velmora-promo-separator" aria-hidden="true"></span>
        <div className="velmora-promo-item">
          <span className="text-base" aria-hidden="true">🚚</span>
          <span>Fast Delivery All Over Bangladesh</span>
        </div>
        <span className="velmora-promo-separator" aria-hidden="true"></span>

        {/* Set 3 */}
        <div className="velmora-promo-item">
          <span className="text-base" aria-hidden="true">🎁</span>
          <span>Upto 35% Off— Biggest Sale of the Year</span>
        </div>
        <span className="velmora-promo-separator" aria-hidden="true"></span>
        <div className="velmora-promo-item">
          <span className="text-base" aria-hidden="true">💳</span>
          <span>Cash on Delivery Available</span>
        </div>
        <span className="velmora-promo-separator" aria-hidden="true"></span>
        <div className="velmora-promo-item">
          <span className="text-base" aria-hidden="true">🚚</span>
          <span>Fast Delivery All Over Bangladesh</span>
        </div>
        <span className="velmora-promo-separator" aria-hidden="true"></span>
      </div>
    </div>
  );
}
