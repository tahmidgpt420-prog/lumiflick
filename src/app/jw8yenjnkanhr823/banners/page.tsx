'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import FileUploadBox from '@/components/admin/FileUploadBox';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Eye,
  Sliders,
} from 'lucide-react';
import { HeroBanner } from '@/types';
import { formatImageUrl } from '@/utils/driveUrl';
import { fetchHeroBanners, broadcastHeroBanners, DEFAULT_HERO_BANNERS } from '@/lib/heroBanners';

async function saveBannerViaApi(banner: HeroBanner) {
  const res = await fetch('/api/admin/banners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(banner),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save banner');
  return data.banner as HeroBanner;
}

async function deleteBannerViaApi(id: string) {
  const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete banner');
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [image, setImage] = useState('');
  const [link, setLink] = useState('/shop');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [badge, setBadge] = useState('Featured');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await fetchHeroBanners();
      setBanners(data);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setBanners(DEFAULT_HERO_BANNERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setEditingBanner(null);
    setImage('');
    setLink('/shop');
    setTitle('');
    setSubtitle('');
    setButtonText('Shop Now');
    setBadge('Featured');
    setOrder(banners.length + 1);
    setIsActive(true);
  };

  const handleEditClick = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setImage(banner.image);
    setLink(banner.link);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setButtonText(banner.buttonText || '');
    setBadge(banner.badge || '');
    setOrder(banner.order || 1);
    setIsActive(banner.isActive !== false);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image.trim()) {
      alert('Please provide a banner image URL or upload an image.');
      return;
    }
    if (!link.trim()) {
      alert('Please enter a destination link for the banner.');
      return;
    }

    try {
      setIsSaving(true);
      const bannerData: HeroBanner = {
        id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
        image: formatImageUrl(image.trim(), 'original'),
        link: link.trim(),
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        buttonText: buttonText.trim() || undefined,
        badge: badge.trim() || undefined,
        order: Number(order) || 1,
        isActive,
      };

      // Optimistically update list
      setBanners((prev) => {
        const idx = prev.findIndex((b) => b.id === bannerData.id);
        let updated: HeroBanner[];
        if (idx >= 0) {
          updated = [...prev];
          updated[idx] = bannerData;
        } else {
          updated = [...prev, bannerData];
        }
        updated = updated.sort((a, b) => (a.order || 0) - (b.order || 0));
        broadcastHeroBanners(updated);
        return updated;
      });

      await saveBannerViaApi(bannerData);

      setSuccessMsg(editingBanner ? 'Banner updated successfully!' : 'New banner added successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);

      resetForm();
    } catch (err: any) {
      console.error('Error saving banner:', err);
      alert('Failed to save banner: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    const previous = banners;
    try {
      setDeletingId(id);
      setBanners((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        broadcastHeroBanners(updated);
        return updated;
      });
      if (editingBanner?.id === id) {
        resetForm();
      }
      await deleteBannerViaApi(id);
    } catch (err: any) {
      console.error('Error deleting banner:', err);
      setBanners(previous);
      alert('Failed to delete banner: ' + (err?.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-assign order numbers
    const newOrdered = updated.map((b, i) => ({ ...b, order: i + 1 }));
    setBanners(newOrdered);
    broadcastHeroBanners(newOrdered);

    // Save updated orders
    try {
      await Promise.all(newOrdered.map((b) => saveBannerViaApi(b)));
    } catch (e) {
      console.error('Error updating banner order:', e);
    }
  };

  return (
    <div>
      <AdminHeader
        title="Homepage Hero Banners"
        description="Add, edit, reorder, and link homepage hero slider banners"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {editingBanner ? (
                  <>
                    <Edit2 className="w-4 h-4 text-amber-500" /> Edit Banner
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-emerald-600" /> Add New Banner
                  </>
                )}
              </h2>
              {editingBanner && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-gray-500 hover:text-black font-semibold"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Upload Box */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1.5">
                  Banner Image <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Upload an image or paste a direct image URL. Recommended ratio: 16:9 or 21:9 (1920x800px).
                </p>
                <FileUploadBox
                  value={image}
                  onChange={(url) => setImage(url)}
                  label="Hero Banner Image"
                  aspectRatio="wide"
                />
              </div>

              {/* Destination Link */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-500" /> Destination Link <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="e.g. /shop or /product-category/anime or /product/slug"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-black transition-colors"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-gray-400 font-medium self-center mr-1">Quick Links:</span>
                  <button
                    type="button"
                    onClick={() => setLink('/shop')}
                    className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-[10px] font-semibold rounded text-gray-700 transition-colors"
                  >
                    /shop
                  </button>
                  <button
                    type="button"
                    onClick={() => setLink('/product-category/best-selling')}
                    className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-[10px] font-semibold rounded text-gray-700 transition-colors"
                  >
                    Best Selling
                  </button>
                  <button
                    type="button"
                    onClick={() => setLink('/product-category/5-frames-set')}
                    className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-[10px] font-semibold rounded text-gray-700 transition-colors"
                  >
                    5-Frame Sets
                  </button>
                </div>
              </div>

              {/* Optional Text Overlay Section */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-gray-400" /> Optional Text Overlay
                  </span>
                  <span className="text-[10px] text-gray-400">(Leave blank for pure image banner)</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Premium Collection / Special Deal"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Main Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Transform Your Empty Walls Into Living Art"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Subtitle Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Handcrafted luxury canvas & textured wooden frames tailored for modern homes."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-black resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Shop Now / Explore Series"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Order & Active Status */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Banner Status
                  </label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:border-black"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : editingBanner ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" /> Update Banner
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save &amp; Add Banner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* List Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" /> Active Hero Banners ({banners.length})
                </h3>
                <p className="text-xs text-gray-500">Slides currently displaying on the homepage</p>
              </div>

              <Link
                href="/"
                target="_blank"
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Preview Storefront
              </Link>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-gray-400 flex items-center justify-center gap-2 bg-white rounded-2xl border border-gray-200">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Loading hero banners...
              </div>
            ) : banners.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-200">
                No hero banners configured yet. Add your first banner using the form on the left.
              </div>
            ) : (
              <div className="space-y-3">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`bg-white rounded-2xl border transition-all p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                      editingBanner?.id === banner.id ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-gray-200'
                    }`}
                  >
                    {/* Thumbnail & Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveOrder(index, 'up')}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-500 hover:text-black transition-colors"
                          title="Move slide earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-bold text-center text-gray-400">
                          #{index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={index === banners.length - 1}
                          onClick={() => moveOrder(index, 'down')}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-500 hover:text-black transition-colors"
                          title="Move slide later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="relative w-28 sm:w-36 h-16 sm:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        <Image
                          src={formatImageUrl(banner.image, 'original')}
                          alt={banner.title || 'Hero Banner'}
                          fill
                          className="object-cover"
                          sizes="144px"
                        />
                      </div>

                      {/* Details */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-gray-900 truncate">
                            {banner.title || 'Pure Image Banner'}
                          </h4>
                          {banner.isActive === false && (
                            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded">
                              Hidden
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{banner.link}</span>
                        </div>

                        {banner.subtitle && (
                          <p className="text-[11px] text-gray-500 line-clamp-1">
                            {banner.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                      <Link
                        href={banner.link}
                        target="_blank"
                        className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                        title="Test link destination"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleEditClick(banner)}
                        className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(banner.id)}
                        disabled={deletingId === banner.id}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
