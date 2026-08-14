import React from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  Package,
  CreditCard,
  Hammer,
  Ban,
  Clock,
  Eye,
  Truck,
  Palette,
  UserCheck,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Terms &amp; Conditions</span>
      </nav>

      <div className="space-y-2 border-b border-gray-100 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif uppercase tracking-tight">
          LumiFlick — Terms &amp; Conditions
        </h1>
        <p className="text-xs text-gray-500">Last Updated: August 2026</p>
      </div>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

        {/* 1. Order Confirmation */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-600" />
            1. Order Confirmation
          </h2>
          <p>
            All orders placed through <strong>LumiFlick</strong> are subject to confirmation by our customer service team.
          </p>
          <p>
            Orders may be confirmed through <strong>WhatsApp, Facebook, or Instagram</strong>. Customers are required to provide accurate contact and delivery information when placing an order.
          </p>
        </section>

        {/* 2. Product Availability */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            2. Product Availability
          </h2>
          <p>
            All products displayed by LumiFlick are available for order. As our products are manufactured specifically according to each customer&apos;s order, we do not maintain ready-made finished-product stock.
          </p>
        </section>

        {/* 3. Pricing and Payment */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-600" />
            3. Pricing and Payment
          </h2>
          <p>
            All product prices are stated in <strong>Bangladeshi Taka (৳ BDT)</strong>.
          </p>
          <p>
            Product prices and delivery charges are listed separately. Customers are required to pay the applicable <strong>delivery charge in advance</strong> when placing an order.
          </p>
          <p>
            The remaining product amount is payable according to the payment terms communicated by LumiFlick at the time of order confirmation.
          </p>
        </section>

        {/* 4. Order Production */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Hammer className="w-4 h-4 text-amber-600" />
            4. Order Production
          </h2>
          <p>
            LumiFlick products are made specifically against customer orders.
          </p>
          <p>
            The standard <strong>manufacturing time is approximately 5–6 working days</strong>. Production begins after the order has been confirmed and the required advance delivery payment has been received.
          </p>
        </section>

        {/* 5. Cancellation Policy */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Ban className="w-4 h-4 text-amber-600" />
            5. Cancellation Policy
          </h2>
          <p>
            As LumiFlick products are manufactured specifically for each customer and production begins after order confirmation, <strong>orders cannot be cancelled once an order has been placed with the required advance delivery payment</strong>.
          </p>
          <p className="text-xs text-gray-500">
            Therefore, customers are advised to carefully verify their selected product, size, design, quantity, and delivery information before confirming an order.
          </p>
        </section>

        {/* 6. Delivery Time */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            6. Delivery Time
          </h2>
          <p>
            The standard delivery period is approximately <strong>7–10 days</strong> from order confirmation.
          </p>
          <p>
            This includes approximately <strong>5–6 days for manufacturing</strong>, with the remaining time required for delivery.
          </p>
          <p className="text-xs text-gray-500">
            Actual delivery time may vary depending on the customer&apos;s location, courier operations, weather, transportation conditions, or other circumstances beyond LumiFlick&apos;s control.
          </p>
        </section>

        {/* 7. Product Inspection Upon Delivery */}
        <section className="space-y-2.5 bg-amber-50/70 p-5 sm:p-6 rounded-2xl border border-amber-200 shadow-sm">
          <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-700" />
            7. Product Inspection Upon Delivery
          </h2>
          <p className="font-medium text-amber-950">
            Customers are required to <strong>check the product carefully in front of the delivery person at the time of delivery</strong>.
          </p>
          <p>
            Any visible damage, breakage, or issue caused during transportation should be identified and reported immediately while the delivery person is present.
          </p>
          <p className="text-xs text-amber-800">
            Once the delivery has been accepted, claims regarding visible transit damage may not be accepted.
          </p>
        </section>

        {/* 8. Damage During Transit */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-600" />
            8. Damage During Transit
          </h2>
          <p>
            LumiFlick takes care to package products securely for delivery. However, if a product is damaged during transportation, LumiFlick will provide a <strong>replacement product</strong> subject to verification of the damage.
          </p>
          <p>
            Customers must inspect the product in front of the delivery person and report any transit damage immediately.
          </p>
        </section>

        {/* 9. Product Color Variation */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-600" />
            9. Product Color Variation
          </h2>
          <p>
            LumiFlick makes every effort to display product colors as accurately as possible. However, <strong>slight differences in color or appearance may occur depending on the customer&apos;s screen, monitor, or device settings</strong>.
          </p>
          <p className="text-xs text-gray-500">
            Such minor variations do not necessarily indicate a defect in the product.
          </p>
        </section>

        {/* 10. Customer Information */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            10. Customer Information
          </h2>
          <p>
            Customers are responsible for providing accurate information, including their <strong>name, phone number, delivery address, product selection, size, and quantity</strong>.
          </p>
          <p className="text-xs text-gray-500">
            LumiFlick will not be responsible for delays or delivery issues resulting from incorrect or incomplete information provided by the customer.
          </p>
        </section>

        {/* 11. Communication */}
        <section className="space-y-2.5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-amber-600" />
            11. Communication
          </h2>
          <p>
            For order-related communication and customer support, customers may contact LumiFlick through our official <strong>WhatsApp, Facebook, or Instagram</strong> channels.
          </p>
          <p>
            Customers are encouraged to keep their provided phone number active and accessible until the order has been successfully delivered.
          </p>
        </section>

        {/* 12. Acceptance of Terms */}
        <section className="space-y-2.5 bg-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            12. Acceptance of Terms
          </h2>
          <p>
            By placing an order with LumiFlick, the customer acknowledges that they have read, understood, and agreed to these Terms &amp; Conditions before confirming their order.
          </p>
          <p className="text-xs text-gray-500">
            LumiFlick reserves the right to update these Terms &amp; Conditions when necessary. Any updated terms will apply to orders placed after the updated terms have been published.
          </p>
        </section>

      </div>
    </div>
  );
}
