'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  let messageText = 'Hello LUMIFLICK! I would like to inquire about glass poster.';

  if (pathname && pathname.startsWith('/product/')) {
    const slug = pathname.replace('/product/', '').trim();
    messageText = `Hello LUMIFLICK! I am browsing your site and interested in this product:\nProduct Slug: ${slug}\nLink: https://www.lumiflick.shop${pathname}`;
  }

  const message = encodeURIComponent(messageText);

  return (
    <a
      href={`https://wa.me/8801400307299?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
      aria-label="Contact on WhatsApp"
      title="Chat with us on WhatsApp (+8801400307299)"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-xs font-bold">
        Chat with us
      </span>
    </a>
  );
}
