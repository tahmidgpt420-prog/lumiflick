'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka',
    zone: 'inside_dhaka' as 'inside_dhaka' | 'outside_dhaka',
    paymentMethod: 'cod' as 'cod' | 'bkash',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const shippingCost = formData.zone === 'inside_dhaka' ? 70 : 130;
  const totalAmount = subtotal + shippingCost;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 11) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi phone number (e.g. 01886670211).');
      return;
    }

    if (!formData.address.trim()) {
      setErrorMessage('Please enter your full delivery address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Generate unique order ID
    const orderId = `GT-${Date.now().toString().slice(-6)}`;

    // Store order record
    const orderRecord = {
      orderId,
      customerName: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      deliveryZone: formData.zone,
      shippingCost,
      paymentMethod: formData.paymentMethod,
      items: [...items],
      subtotal,
      total: totalAmount,
      orderDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      notes: formData.notes,
    };

    try {
      // 1. Post to Server-Side API for Admin panel
      await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRecord),
      });

      // 2. Also save to localStorage for client receipt page
      localStorage.setItem(`gt_order_${orderId}`, JSON.stringify(orderRecord));

      clearCart();
      router.push(`/order-success/${orderId}`);
    } catch (e) {
      console.error(e);
      // Fallback
      localStorage.setItem(`gt_order_${orderId}`, JSON.stringify(orderRecord));
      clearCart();
      router.push(`/order-success/${orderId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors"
        >
          Browse Wall Art
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-black">
          Cart
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Express Checkout</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Express Checkout
        </h1>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Delivery & Customer Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Contact */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              Contact & Delivery Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Full Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House #, Road #, Area/Sector, Thana, District"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Order Special Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery, gift wrap, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Delivery Zone Selector */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              Select Delivery Area
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                  formData.zone === 'inside_dhaka'
                    ? 'border-black bg-gray-50/70 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="delivery_zone"
                    checked={formData.zone === 'inside_dhaka'}
                    onChange={() => setFormData({ ...formData, zone: 'inside_dhaka', city: 'Dhaka' })}
                    className="accent-black w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      Inside Dhaka City
                    </span>
                    <span className="text-xs text-gray-500">2-3 Business Days</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-gray-900">৳ 70</span>
              </label>

              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                  formData.zone === 'outside_dhaka'
                    ? 'border-black bg-gray-50/70 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="delivery_zone"
                    checked={formData.zone === 'outside_dhaka'}
                    onChange={() => setFormData({ ...formData, zone: 'outside_dhaka' })}
                    className="accent-black w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      Outside Dhaka / All BD
                    </span>
                    <span className="text-xs text-gray-500">3-5 Business Days</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-gray-900">৳ 130</span>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              Payment Method
            </h2>

            <div className="space-y-3">
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all block ${
                  formData.paymentMethod === 'cod'
                    ? 'border-black bg-gray-50/70 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className="accent-black w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      Cash On Delivery (COD)
                    </span>
                    <span className="text-xs text-gray-500">
                      Pay cash to courier upon inspecting & receiving the parcel.
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all block ${
                  formData.paymentMethod === 'bkash'
                    ? 'border-black bg-gray-50/70 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={formData.paymentMethod === 'bkash'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                    className="accent-black w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-bold text-pink-600 block">
                      bKash / Nagad Advance Payment
                    </span>
                    <span className="text-xs text-gray-500">
                      Send money to Merchant number 01886670211.
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Place Order Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 sticky top-28">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">
              Order Items ({items.length})
            </h2>

            {/* Compact items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-200 pr-1 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-200">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                    <p className="text-[11px] text-gray-500">
                      {item.selectedSize} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    ৳ {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Cost ({formData.zone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-semibold text-gray-900">৳ {shippingCost}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-base sm:text-lg font-black text-gray-900">
                <span>Grand Total</span>
                <span>৳ {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black text-white font-extrabold text-sm rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/15 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Processing Order...'
              ) : (
                <>
                  Confirm Order (৳ {totalAmount.toLocaleString()}) <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-center text-gray-400 space-y-1">
              <p>🔒 100% Secure Checkout Guaranteed</p>
              <p>By placing order, you agree to LUMIFLICK Terms of Service.</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
