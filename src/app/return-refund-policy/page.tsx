import React from 'react';
import Link from 'next/link';

export default function ReturnRefundPolicyPage() {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Return & Refund Policy</span>
      </nav>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900">Return & Replacement Policy</h1>
        <p className="text-xs text-gray-500">Last updated: February 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Damaged or Incorrect Item Policy</h2>
          <p>
            Customer satisfaction is our utmost priority. If you receive an item that is damaged during transit or incorrect in print/size:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Please record an unboxing video or take clear photos of the defect immediately upon delivery.</li>
            <li>Contact our customer support hotline at <strong>+8801886670211</strong> or message us on WhatsApp within 24 hours.</li>
            <li>We will send a <strong>brand new free replacement</strong> immediately without charging any additional shipping fees.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. Return Eligibility</h2>
          <p>
            Items must be in original condition with mounting brackets and original packaging intact. Customized personalized frames (with personal photos) are non-returnable unless defective.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Refund Process</h2>
          <p>
            If a replacement is unavailable, refunds will be initiated to your bKash/Nagad or bank account within 3-5 business days of verification.
          </p>
        </section>
      </div>
    </div>
  );
}
