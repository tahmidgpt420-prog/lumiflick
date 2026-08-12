'use client';

import React, { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Save, CheckCircle2, Shield, Phone, MapPin, Truck } from 'lucide-react';
import { StoreSettings } from '@/data/db';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'LUMIFLICK',
    phone: '+8801886670211',
    email: 'info@lumiflick.shop',
    address: 'Matbor bari, Baunia, Uttara, Dhaka, Bangladesh',
    insideDhakaDelivery: 70,
    outsideDhakaDelivery: 130,
    promoNotice: '🎁 Upto 35% Off— Biggest Sale of the Year',
    adminPin: 'lumiflick2026',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Store & Delivery Settings"
        description="Configure delivery shipping fees, store contact info, WhatsApp number, and top banner notices"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Store settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Delivery Charges */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Truck className="w-4 h-4 text-amber-600" />
              Delivery Shipping Rates (৳ BDT)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Inside Dhaka City Rate (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={settings.insideDhakaDelivery}
                  onChange={(e) =>
                    setSettings({ ...settings, insideDhakaDelivery: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Outside Dhaka / Sub-Dhaka Rate (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={settings.outsideDhakaDelivery}
                  onChange={(e) =>
                    setSettings({ ...settings, outsideDhakaDelivery: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Phone className="w-4 h-4 text-amber-600" />
              Store Contacts & Hotline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Hotline / WhatsApp Number
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Workshop Address
                </label>
                <input
                  type="text"
                  required
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Top Marquee Notice */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Promotional Banner Notice
            </h3>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Announcement Ticker Text
              </label>
              <input
                type="text"
                value={settings.promoNotice}
                onChange={(e) => setSettings({ ...settings, promoNotice: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Admin Security */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Shield className="w-4 h-4 text-amber-600" />
              Admin Password / PIN
            </h3>
            <div className="max-w-xs">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Dashboard Passcode
              </label>
              <input
                type="text"
                value={settings.adminPin}
                onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-black/10 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
