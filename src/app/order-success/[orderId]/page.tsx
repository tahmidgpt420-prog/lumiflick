'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CheckCircle, MessageCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { OrderDetails } from '@/types';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (orderId) {
      const stored = localStorage.getItem(`gt_order_${orderId}`);
      if (stored) {
        try {
          setOrder(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [orderId]);

  const whatsappMessage = encodeURIComponent(
    `Hello LUMIFLICK, I placed an order. Please let me know the tracking and delivery update.`
  );

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Success Banner */}
      <div className="text-center space-y-3 mb-10">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Thank You! Your Order Is Processing.
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          We have received your order. Our customer representative will call you shortly to confirm before dispatch.
        </p>
      </div>

      {/* Invoice Box */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200">
                <Image src="/logo.png" alt="LUMIFLICK Logo" fill className="object-cover" />
              </div>
              <span className="font-bold uppercase tracking-wider text-black text-base font-serif">LUMIFLICK</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-gray-500">Order Date:</span>
            <p className="text-xs font-bold text-gray-800">{order?.orderDate || 'Today'}</p>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="text-xs text-gray-700 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2">
            Delivery Address
          </h3>
          <p className="font-bold text-sm text-gray-900">{order?.customerName || 'Valued Customer'}</p>
          <p className="mt-1">{order?.address}</p>
          <p className="font-medium text-gray-900 mt-1">Phone: {order?.phone}</p>
        </div>

        {/* Itemized Table */}
        <div className="divide-y divide-gray-100">
          <h3 className="font-bold text-gray-900 text-sm pb-2">Purchased Items</h3>
          {order?.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">{item.title}</h4>
                    <p className="text-[11px] text-gray-500">
                      {item.selectedSize} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  ৳ {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 py-2">Standard Premium Glass Poster Order</p>
          )}
        </div>

        {/* Total Summary */}
        <div className="border-t border-gray-200 pt-4 space-y-1.5 text-xs text-right">
          <div className="flex justify-between sm:justify-end gap-6 text-gray-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-gray-900">৳ {order?.subtotal?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between sm:justify-end gap-6 text-gray-600">
            <span>Shipping:</span>
            <span className="font-semibold text-gray-900">To be confirmed via WhatsApp or Messenger</span>
          </div>
          <div className="flex justify-between sm:justify-end gap-6 text-base sm:text-lg font-black text-gray-900 pt-2 border-t border-gray-100">
            <span>Total Payable:</span>
            <span>৳ {order?.total?.toLocaleString() || '0'}</span>
          </div>
          <p className="text-[11px] text-gray-400 font-normal">+ Delivery Charge (confirmed via WhatsApp or Messenger)</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <a
            href={`https://wa.me/8801410307299?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" /> WhatsApp Tracking Support
          </a>
          <Link
            href="/shop"
            className="flex-1 py-3 px-4 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
