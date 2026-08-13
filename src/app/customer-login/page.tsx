'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';

export default function CustomerLoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Customer accounts aren't implemented yet — this used to fake a
    // successful login/signup with no backend behind it, which told
    // shoppers they had an account and a session when neither existed.
    alert(
      'Customer accounts are coming soon! For now, orders are placed via WhatsApp/checkout — no login needed.'
    );
  };

  return (
    <div className="py-12 sm:py-16 max-w-md mx-auto px-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {isRegister ? 'Create an Account' : 'Customer Login'}
          </h1>
          <p className="text-xs text-gray-500">
            {isRegister
              ? 'Join LUMIFLICK to track your frame orders and wishlists'
              : 'Sign in to manage your orders & delivery addresses'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakib Al Hasan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="name@example.com / 018XXXXXXXX"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              {!isRegister && (
                <a href="#" className="text-[11px] text-amber-700 hover:underline">
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md shadow-black/10"
          >
            {isRegister ? 'Register Account' : 'Sign In'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-600">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-bold text-black hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-bold text-black hover:underline"
              >
                Create One Now
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
