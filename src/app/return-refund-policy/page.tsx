import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, RefreshCw, PackageCheck, CreditCard } from 'lucide-react';

export default function ReturnRefundPolicyPage() {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Return &amp; Replacement Policy</span>
      </nav>

      <div className="space-y-2 border-b border-gray-100 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif uppercase tracking-tight">
          LumiFlick — Return &amp; Replacement Policy
        </h1>
        <p className="text-xs text-gray-500">Last Updated: August 2026</p>
      </div>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-600" />
            1. Damaged or Incorrect Product
          </h2>
          <p>
            At <strong>LumiFlick</strong>, customer satisfaction is our top priority. If you receive a product that has been <strong>damaged during transit or is incorrect in print, design, or size</strong>, please contact us in front of the delivery man.
          </p>
          <p>
            After verification, LumiFlick will provide a <strong>replacement product at no additional cost</strong>, including the applicable replacement delivery charges for confirmed transit damage or incorrect products.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            2. Replacement Eligibility
          </h2>
          <p>
            To be eligible for a replacement, the product must be reported within the specified time and the issue must be verified by LumiFlick.
          </p>
          <p>
            Customers should retain the <strong>original packaging and all included components</strong> until the issue has been reviewed and resolved.
          </p>
          <p className="text-xs text-gray-500">
            Products damaged after delivery due to customer handling, misuse, improper installation, or other causes unrelated to transit may not be eligible for replacement.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-amber-600" />
            3. Customized Products
          </h2>
          <p>
            Products made according to a customer&apos;s <strong>personalized design, photograph, or specific customization request</strong> are non-returnable and non-replaceable unless the product is confirmed to have a manufacturing defect, printing error, incorrect size, or damage during transit.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-600" />
            4. Refund Policy
          </h2>
          <p>
            LumiFlick primarily provides <strong>replacement products</strong> rather than refunds for damaged or incorrect items.
          </p>
          <p>
            If a replacement cannot be provided for a verified issue, a refund may be considered on a case-by-case basis.
          </p>
          <p>
            Where a refund is approved, it will be processed to the customer&apos;s <strong>bKash, Nagad, or bank account</strong> within approximately <strong>3–5 business days after verification and approval</strong>.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 bg-amber-50/70 p-5 sm:p-6 rounded-2xl border border-amber-200 shadow-sm">
          <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            5. Important Note
          </h2>
          <p className="text-amber-950 font-medium">
            Customers are strongly advised to <strong>inspect the product in front of the delivery person before accepting the delivery</strong>.
          </p>
          <p className="text-xs text-amber-800">
            Any visible damage should be reported immediately and supported with clear photographic or video evidence.
          </p>
        </section>

      </div>
    </div>
  );
}
