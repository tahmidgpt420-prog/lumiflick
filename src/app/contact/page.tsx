'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageSquare, Facebook, Instagram, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="py-8 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Contact Us</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Get in Touch With Us
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Have questions about custom wall frame sizes, bulk orders, or tracking your delivery? Connect directly with us through WhatsApp, Facebook, Instagram, or call us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Instant Messaging & Social Channels */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold text-gray-900">Direct & Social Channels</h2>
            </div>
            <p className="text-xs text-gray-600">
              For the quickest response, reach out to our team via WhatsApp, Facebook Messenger, or Instagram DM.
            </p>

            <div className="space-y-3 pt-2">
              {/* WhatsApp */}
              <a
                href="https://wa.me/8801400307299?text=Hello%20LUMIFLICK!%20I%20would%20like%20to%20inquire%20about%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-gray-900 rounded-xl font-semibold text-xs flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MessageSquare className="w-4 h-4 fill-white" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-gray-900">WhatsApp Support</span>
                    <span className="text-[11px] text-gray-500">Fastest reply • Daily 10 AM - 10 PM</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/LumiFlick"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 rounded-xl font-semibold text-xs flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-gray-900">Facebook Page</span>
                    <span className="text-[11px] text-gray-500">@LumiFlick • Updates & Messenger</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/lumi.flick/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 rounded-xl font-semibold text-xs flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-gray-900">Instagram Profile</span>
                    <span className="text-[11px] text-gray-500">@lumi.flick • Photo gallery & DMs</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Customer Support Desk & Office Info */}
        <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Helpline & Studio Details</h2>
            <p className="text-xs text-gray-600 mt-1">
              Official customer service desk and order inquiry contacts.
            </p>
          </div>

          <div className="space-y-4 text-xs text-gray-700">
            <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Direct Phone Helpline</h4>
                <p className="mt-0.5 font-semibold text-gray-800">+8801400307299</p>
                <p className="text-gray-500 text-[11px]">Available Daily: 10:00 AM - 10:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Official Email Support</h4>
                <p className="mt-0.5 font-semibold text-gray-800">lumiflick@gmail.com</p>
                <p className="text-gray-500 text-[11px]">We reply within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Workshop & Studio</h4>
                <p className="mt-0.5 text-gray-800">PTI Mor, Khulna, Bangladesh - 9100</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Online Order Processing</h4>
                <p className="mt-0.5 text-gray-800">24 Hours / 7 Days a week</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
