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
  MessageCircle,
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
    zone: 'standard' as string,
    paymentMethod: 'cod' as string,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const shippingCost = 0;
  const totalAmount = subtotal;

  const [submitChannel, setSubmitChannel] = useState<'whatsapp' | 'messenger'>('whatsapp');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 11) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi phone number (e.g. 01400307299).');
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

    // Build products list for order message
    const orderItemsText = items
      .map((item, i) => {
        const pieceStr = item.selectedPiecesLabel ? ` (${item.selectedPiecesLabel})` : '';
        return `   ${i + 1}. ${item.title}\n      • Variation: ${item.selectedSize}${pieceStr}\n      • Qty: ${item.quantity}\n      • Price: ${(item.price * item.quantity).toLocaleString()} BDT + Delivery Charge`;
      })
      .join('\n');

    const orderMessage = [
      `Hello LUMIFLICK! I want to confirm my order:`,
      ``,
      `👤 *Customer Details:*`,
      `• Name: ${formData.name}`,
      `• Phone: ${formData.phone}`,
      `• Address: ${formData.address}`,
      formData.email ? `• Email: ${formData.email}` : '',
      formData.notes ? `• Special Notes: ${formData.notes}` : '',
      ``,
      `🛍️ *Products in Cart:*`,
      orderItemsText,
      ``,
      `💰 *Total Price:* ${totalAmount.toLocaleString()} BDT + Delivery Charge`,
    ]
      .filter((line) => line !== '')
      .join('\n');

    const encodedMessage = encodeURIComponent(orderMessage);
    const redirectUrl = submitChannel === 'messenger'
      ? `https://m.me/LumiFlick?text=${encodedMessage}`
      : `https://wa.me/8801400307299?text=${encodedMessage}`;

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
      status: 'pending',
    };

    try {
      localStorage.setItem(`gt_order_${orderId}`, JSON.stringify(orderRecord));
      clearCart();
      window.location.href = redirectUrl;
    } catch (err) {
      console.error(err);
      window.location.href = redirectUrl;
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Add some beautiful handcrafted glass posters to your cart to proceed with checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
        >
          Explore Collections <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Contact */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-900" />
              Contact &amp; Delivery Information
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
                      {item.selectedSize}{item.selectedPiecesLabel ? ` (${item.selectedPiecesLabel})` : ''} × {item.quantity}
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

            {/* WhatsApp Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setSubmitChannel('whatsapp')}
              className="w-full py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/25 active:scale-[0.98] disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5 fill-white text-white" />
              {isSubmitting && submitChannel === 'whatsapp' ? (
                'Opening WhatsApp...'
              ) : (
                <>Confirm Order on WhatsApp (৳ {totalAmount.toLocaleString()})</>
              )}
            </button>

            {/* Messenger Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setSubmitChannel('messenger')}
              className="w-full py-4 bg-[#0084FF] hover:bg-[#0073E6] text-white font-extrabold text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#0084FF]/25 active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.51 3.24 7.34-.17 1.05-.62 2.7-1.78 3.84 0 0 2.5-.2 4.46-1.55.67.19 1.38.29 2.08.29 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.09 13.06l-2.73-2.91-5.33 2.91 5.86-6.22 2.8 2.91 5.26-2.91-5.86 6.22z" />
              </svg>
              {isSubmitting && submitChannel === 'messenger' ? (
                'Opening Messenger...'
              ) : (
                <>Confirm Order on Messenger (৳ {totalAmount.toLocaleString()})</>
              )}
            </button>

            {/* Delivery Charge Note */}
            <p className="text-xs text-center text-gray-600 font-medium">
              * Delivery charge applicable according to product weight
            </p>

            <div className="text-[11px] text-center text-gray-400 space-y-1 pt-1">
              <p>🔒 100% Secure Checkout Guaranteed</p>
              <p>By placing order, you agree to LUMIFLICK Terms of Service.</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
