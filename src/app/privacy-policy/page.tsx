import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Privacy Policy</span>
      </nav>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
        <p className="text-xs text-gray-500">Last updated: February 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Information We Collect</h2>
          <p>
            When you place an order on GenuineTask, we collect necessary customer details including your name, contact phone number, delivery address, and optional email address.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. How We Use Your Information</h2>
          <p>
            Your information is strictly used for processing and shipping your orders, communicating delivery updates via phone/SMS/WhatsApp, and providing after-sales support.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Data Protection</h2>
          <p>
            We do not sell, rent, or distribute your private contact details to any third parties other than the contracted courier service for delivery purposes.
          </p>
        </section>
      </div>
    </div>
  );
}
