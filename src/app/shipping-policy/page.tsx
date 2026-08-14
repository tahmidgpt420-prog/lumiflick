import React from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Send,
  Clock,
  Package,
  CheckCircle2,
} from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Delivery &amp; Shipping Policy</span>
      </nav>

      <div className="space-y-2 border-b border-gray-100 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif uppercase tracking-tight">
          LumiFlick — Delivery &amp; Shipping Policy
        </h1>
        <p className="text-xs text-gray-500">Last Updated: August 2026</p>
      </div>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

        {/* 1. Delivery Timeframes & Rates */}
        <section className="space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-600" />
            1. Delivery Timeframes &amp; Charges
          </h2>
          <p>
            At <strong>LumiFlick</strong>, every glass poster is <strong>made to order</strong> to ensure that each product meets our highest quality standards before dispatch.
          </p>

          <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200/70">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              All Over Bangladesh
            </h3>
            <p className="text-xs sm:text-sm text-gray-700">
              Orders are generally delivered within <strong>7–10 days</strong>, including approximately <strong>5–6 days for manufacturing</strong> and the remaining time for delivery.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Standard Delivery Charges by Parcel Size:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-gray-200 text-center shadow-2xs">
                <span className="text-xs text-gray-500 font-medium block">Small Glass Poster</span>
                <span className="text-lg font-bold text-gray-900">৳130</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200 text-center shadow-2xs">
                <span className="text-xs text-gray-500 font-medium block">Medium Glass Poster</span>
                <span className="text-lg font-bold text-gray-900">৳150</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200 text-center shadow-2xs">
                <span className="text-xs text-gray-500 font-medium block">Large Glass Poster</span>
                <span className="text-lg font-bold text-gray-900">৳170</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            As our glass posters are <strong>heavy-weight parcels</strong>, delivery charges are calculated based on the package size and weight. Therefore, charges may vary depending on the specific order and delivery location.
          </p>
          <p className="text-xs text-gray-500">
            Delivery times may vary slightly depending on the customer&apos;s location, courier operations, weather, traffic, or other circumstances beyond our control.
          </p>
        </section>

        {/* 2. Packaging Safety */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            2. Packaging Safety
          </h2>
          <p>
            We take great care in packaging every glass poster to minimize the possibility of damage during transportation.
          </p>
          <p>
            Each order is carefully packed using appropriate protective materials and securely sealed before being handed over to the delivery service.
          </p>
          <p className="text-xs text-gray-500">
            Despite our careful packaging, damage may occasionally occur during transit.
          </p>
        </section>

        {/* 3. Delivery & Payment */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-600" />
            3. Delivery &amp; Payment
          </h2>
          <p>
            The applicable <strong>delivery charge must be paid in advance when placing the order</strong>.
          </p>
          <p>
            The remaining payment will be collected according to the payment terms communicated by LumiFlick during order confirmation.
          </p>
          <p className="font-medium text-gray-900">
            Customers are strongly advised to <strong>inspect the product carefully in front of the delivery person before accepting the delivery</strong>.
          </p>
        </section>

        {/* 4. Damaged Products During Transit */}
        <section className="space-y-2.5 bg-amber-50/70 p-5 sm:p-6 rounded-2xl border border-amber-200 shadow-sm">
          <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            4. Damaged Products During Transit
          </h2>
          <p className="font-medium text-amber-950">
            If your glass poster is damaged during transportation, you must <strong>check the product in front of the delivery person and report the damage immediately</strong>.
          </p>
          <p>
            After verification of the transit damage, <strong>LumiFlick will arrange a replacement product</strong>.
          </p>
          <p className="text-xs text-amber-800">
            Please note that claims for visible transit damage reported after the delivery has been accepted may not be eligible for replacement.
          </p>
        </section>

        {/* 5. Order Tracking */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-600" />
            5. Order Tracking
          </h2>
          <p>
            Once your order has been <strong>dispatched and handed over to the courier</strong>, you will receive an <strong>SMS containing a tracking link on the phone number provided with your order</strong>.
          </p>
          <p className="text-xs text-gray-500">
            You can use the tracking link to check the current real-time delivery status of your package.
          </p>
        </section>

      </div>
    </div>
  );
}
