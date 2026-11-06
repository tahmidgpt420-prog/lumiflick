'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { MessageCircle, Copy, Check, ShoppingBag, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { OrderDetails } from '@/types';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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

  // Construct message for WhatsApp and Messenger
  const orderItemsText =
    order?.items && order.items.length > 0
      ? order.items
          .map((item, i) => {
            const pieceStr = item.selectedPiecesLabel ? ` (${item.selectedPiecesLabel})` : '';
            return `   ${i + 1}. ${item.title}\n      • Variation: ${item.selectedSize}${pieceStr}\n      • Qty: ${item.quantity}\n      • Price: ${(item.price * item.quantity).toLocaleString()} BDT`;
          })
          .join('\n')
      : 'Standard Premium Glass Poster Order';

  const orderMessage = [
    `Hello LUMIFLICK! I want to confirm my order (${order?.orderId || orderId}):`,
    ``,
    order?.customerName && order.customerName !== 'Valued Customer'
      ? `👤 *Customer Details:*\n• Name: ${order.customerName}\n• Phone: ${order.phone}\n• Address: ${order.address}${order.email ? `\n• Email: ${order.email}` : ''}`
      : '',
    order?.notes ? `• Special Notes: ${order.notes}` : '',
    ``,
    `🛍️ *Ordered Products:*`,
    orderItemsText,
    ``,
    `💰 *Total Price:* ${(order?.total || order?.subtotal || 0).toLocaleString()} BDT + Delivery Charge`,
  ]
    .filter(Boolean)
    .join('\n');

  const encodedMessage = encodeURIComponent(orderMessage);
  const whatsappUrl = `https://wa.me/8801410307299?text=${encodedMessage}`;
  const messengerUrl = `https://m.me/LumiFlick?text=${encodedMessage}`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(orderMessage)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {});
  };

  const hasCustomerDetails =
    order?.customerName &&
    order.customerName.trim() !== '' &&
    order.customerName !== 'Valued Customer' &&
    order?.address &&
    order.address.trim() !== '';

  return (
    <div className="py-8 sm:py-14 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Action Required Banner — No premature order confirmation */}
      <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-5 sm:p-7 shadow-sm text-center space-y-4">
        
        {/* Ready Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>Message Pre-filled &amp; Ready Every Time &bull; মেসেজ প্রস্তুত আছে</span>
        </div>

        {/* Bilingual Heading */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Just Press &ldquo;Send&rdquo; on WhatsApp or Messenger
          </h1>
          <p className="text-base sm:text-lg font-bold text-amber-900">
            অর্ডার নিশ্চিত করতে শুধু &lsquo;Send&rsquo; বাটনে চাপ দিন
          </p>
        </div>

        {/* Clear Instructions */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 text-left space-y-3.5">
          
          {/* Main instruction */}
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div className="text-xs sm:text-sm text-gray-800 space-y-0.5">
              <p className="font-bold text-gray-900">
                Your order message is pre-filled and ready every time. Simply tap <strong>Send</strong>.
              </p>
              <p className="text-gray-600 font-medium">
                আপনার অর্ডারের সম্পূর্ণ মেসেজটি তৈরি করা আছে। হোয়াটসঅ্যাপ বা মেসেঞ্জারে গিয়ে শুধু <strong className="text-black">&lsquo;Send&rsquo;</strong> বাটনে চাপ দিন।
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Fallback instruction */}
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div className="text-xs sm:text-sm text-gray-700 space-y-0.5">
              <p className="font-semibold text-gray-800">
                If the pre-filled text didn&rsquo;t appear on your phone, it is already copied to your clipboard &mdash; just <strong>Paste</strong> and send.
              </p>
              <p className="text-gray-500 font-medium text-[11px] sm:text-xs">
                ফোনে মেসেজ নিজে থেকে না আসলে, এটি আগেই কপি করা আছে &mdash; চ্যাটে গিয়ে শুধু <strong className="text-gray-800">&lsquo;Paste&rsquo;</strong> করে পাঠিয়ে দিন।
              </p>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span>Send on WhatsApp &bull; হোয়াটসঅ্যাপে পাঠান</span>
            </a>

            {/* Messenger CTA */}
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-4 bg-[#0084FF] hover:bg-[#0073E6] text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0084FF]/20 active:scale-[0.98]"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.51 3.24 7.34-.17 1.05-.62 2.7-1.78 3.84 0 0 2.5-.2 4.46-1.55.67.19 1.38.29 2.08.29 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.09 13.06l-2.73-2.91-5.33 2.91 5.86-6.22 2.8 2.91 5.26-2.91-5.86 6.22z" />
              </svg>
              <span>Send on Messenger &bull; মেসেঞ্জারে পাঠান</span>
            </a>
          </div>

          {/* Copy Message Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              copied
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>✓ Copied to clipboard! &bull; মেসেজ কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Copy Order Message (if needed) &bull; মেসেজ কপি করুন</span>
              </>
            )}
          </button>

          {/* Optional Message Preview Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-[11px] font-semibold text-amber-900/70 hover:text-amber-900 inline-flex items-center gap-1 transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>{showPreview ? 'Hide Message Preview' : 'View Pre-filled Message Text'}</span>
              {showPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showPreview && (
              <div className="mt-2 text-left bg-white rounded-xl p-3 border border-amber-200 shadow-inner">
                <pre className="text-[11px] text-gray-700 whitespace-pre-wrap font-sans leading-relaxed select-all">
                  {orderMessage}
                </pre>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-gray-200 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200">
              <Image src="/logo.png" alt="LUMIFLICK Logo" fill className="object-cover" />
            </div>
            <span className="font-bold uppercase tracking-wider text-black text-base font-serif">LUMIFLICK</span>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-gray-500 font-medium">Order ID: </span>
            <span className="font-bold text-gray-900">#{order?.orderId || orderId}</span>
            <p className="text-gray-400 text-[11px] mt-0.5">{order?.orderDate || 'Today'}</p>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="text-xs text-gray-700 bg-gray-50 p-4 rounded-xl">
          <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-1.5">
            Delivery Details
          </h3>
          {hasCustomerDetails ? (
            <div className="space-y-0.5">
              <p className="font-bold text-sm text-gray-900">{order?.customerName}</p>
              <p className="text-gray-700">{order?.address}</p>
              <p className="font-medium text-gray-900">Phone: {order?.phone}</p>
              {order?.notes && <p className="text-gray-500 italic mt-1">Note: {order.notes}</p>}
            </div>
          ) : (
            <div className="space-y-0.5 text-gray-600">
              <p className="font-medium">
                Your delivery address will be confirmed in WhatsApp or Messenger chat.
              </p>
              <p className="text-[11px] text-gray-500">
                ডেলিভারি ঠিকানা ও ফোন নম্বর হোয়াটসঅ্যাপ বা মেসেঞ্জার চ্যাটে নেয়া হবে।
              </p>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="divide-y divide-gray-100">
          <h3 className="font-bold text-gray-900 text-sm pb-2">Selected Items</h3>
          {order?.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    <Image
                      src={item.image}
                      sizes="48px"
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">{item.title}</h4>
                    <p className="text-[11px] text-gray-500">
                      {item.selectedSize}
                      {item.selectedPiecesLabel ? ` (${item.selectedPiecesLabel})` : ''} &times; {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  ৳ {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 py-2">Glass Poster Order</p>
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
            <span>৳ {order?.total?.toLocaleString() || order?.subtotal?.toLocaleString() || '0'}</span>
          </div>
          <p className="text-[11px] text-gray-400 font-normal">+ Delivery Charge (confirmed via WhatsApp or Messenger)</p>
        </div>

        {/* Continue Shopping Action */}
        <div className="pt-2 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping &bull; আরও কেনাকাটা করুন
          </Link>
        </div>

      </div>

    </div>
  );
}
