import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-24 sm:py-32 max-w-2xl mx-auto px-4 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6">
        <SearchX className="w-8 h-8 text-amber-600" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-3 text-sm text-gray-500 leading-relaxed">
        This page doesn&apos;t exist or is no longer available.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-flex items-center gap-1.5 px-6 py-2.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Explore All Collections
      </Link>
    </div>
  );
}
