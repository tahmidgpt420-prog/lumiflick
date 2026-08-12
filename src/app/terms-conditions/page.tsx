import React from 'react';
import Link from 'next/link';

export default function TermsConditionsPage() {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Terms & Conditions</span>
      </nav>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900">Terms & Conditions</h1>
        <p className="text-xs text-gray-500">Last updated: February 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Order Confirmation</h2>
          <p>
            All orders placed on lumiflick.shop are subject to availability and phone verification by our customer team.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. Pricing and Product Information</h2>
          <p>
            Prices for products are quoted in Bangladeshi Taka (৳ BDT) and include relevant standard taxes. We strive for accurate representations of colors, though slight variances may occur depending on screen monitors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Cancellation Policy</h2>
          <p>
            Orders can be cancelled before dispatch by calling our customer service hotline at +8801886670211 or texting on WhatsApp.
          </p>
        </section>
      </div>
    </div>
  );
}
