import React from 'react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Shipping Policy</span>
      </nav>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900">Shipping & Delivery Policy</h1>
        <p className="text-xs text-gray-500">Last updated: February 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Delivery Timeframes</h2>
          <p>
            At LUMIFLICK, every frame set is made to order to maintain strict quality standards before dispatch.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Inside Dhaka City:</strong> Delivered within 2 to 3 working days (Delivery fee: ৳70).</li>
            <li><strong>Outside Dhaka (All Over Bangladesh):</strong> Delivered within 3 to 5 working days via trusted courier partners like Steadfast & RedX (Delivery fee: ৳130).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. Packaging Safety</h2>
          <p>
            We take utmost care in packaging our wall frames. Each order is wrapped in multiple layers of shock-absorbent bubble wrap, reinforced with plastic corner protectors, and sealed in heavy-duty corrugated cartons to prevent damage during transit.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Cash on Delivery (COD)</h2>
          <p>
            Cash on Delivery is available across all 64 districts in Bangladesh. You may inspect the outer package before receiving and making the payment to the delivery rider.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">4. Tracking Your Order</h2>
          <p>
            Once your package has been handed over to the delivery courier, you will receive an SMS and WhatsApp update with your courier consignment tracking code.
          </p>
        </section>
      </div>
    </div>
  );
}
