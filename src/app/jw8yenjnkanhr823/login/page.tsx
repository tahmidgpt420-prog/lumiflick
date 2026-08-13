'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const REQUIRED_USERNAME = 'taian.admin@lumiflick';
const REQUIRED_PASSWORD = 'iukaghskjd367@7i62*&t872';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === '1';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (username.trim() === REQUIRED_USERNAME && password === REQUIRED_PASSWORD) {
      localStorage.setItem('gt_admin_auth', 'true');
      localStorage.setItem('gt_admin_last_active', Date.now().toString());
      setTimeout(() => {
        router.push('/jw8yenjnkanhr823');
      }, 300);
    } else {
      setIsLoading(false);
      setError('Invalid username or password. Access denied.');
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Sign In to Dashboard
        </h2>
        <span className="text-[11px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Secure Access
        </span>
      </div>

      {isExpired && !error && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Session expired due to 1 hour of inactivity. Please log in again.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Admin Username
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-400 transition-colors"
              placeholder="Enter username"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Passcode / Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-400 transition-colors"
              placeholder="Enter password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Authenticating...' : 'Enter Admin Panel'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 text-center border-t border-gray-800">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Back to Public Store
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand */}
      <div className="text-center mb-8 space-y-2">
        <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto shadow-2xl border-2 border-gray-700">
          <Image src="/logo.png" alt="LUMIFLICK Logo" fill className="object-cover" />
        </div>
        <h1 className="text-2xl font-black tracking-widest text-white uppercase font-serif">
          LUMIFLICK Admin
        </h1>
        <p className="text-xs text-gray-400">
          Store Management &amp; Product Control Portal
        </p>
      </div>

      <Suspense fallback={<div className="text-white text-xs">Loading login form...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
