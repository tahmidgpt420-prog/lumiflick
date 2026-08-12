'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Default admin passcode
    if (
      (username === 'admin' && (password === 'genuine2026' || password === 'admin' || password === '123456')) ||
      password === 'genuine2026'
    ) {
      localStorage.setItem('gt_admin_auth', 'true');
      setTimeout(() => {
        router.push('/admin');
      }, 300);
    } else {
      setIsLoading(false);
      setError('Invalid username or password. Default passcode is "genuine2026".');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand */}
      <div className="text-center mb-8 space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-white text-black font-black text-2xl flex items-center justify-center mx-auto shadow-2xl">
          GT
        </div>
        <h1 className="text-2xl font-black tracking-widest text-white uppercase">
          GenuineTask Admin
        </h1>
        <p className="text-xs text-gray-400">
          Store Management & Product Control Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Sign In to Dashboard
          </h2>
          <span className="text-[11px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secure Access
          </span>
        </div>

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
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
              />
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Admin Password / PIN (Default: <code className="text-amber-400">genuine2026</code>)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (genuine2026)"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
          >
            {isLoading ? 'Verifying...' : 'Access Admin Dashboard'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-800/80">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            &larr; Back to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
