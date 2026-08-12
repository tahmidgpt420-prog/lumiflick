'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Image as ImageIcon, Check } from 'lucide-react';

interface ImageGalleryPickerProps {
  primaryImage: string;
  galleryImages: string[];
  onPrimaryChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
}

export default function ImageGalleryPicker({
  primaryImage,
  galleryImages,
  onPrimaryChange,
  onGalleryChange,
}: ImageGalleryPickerProps) {
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [imageError, setImageError] = useState(false);

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    if (!galleryImages.includes(newGalleryUrl.trim())) {
      onGalleryChange([...galleryImages, newGalleryUrl.trim()]);
    }
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    onGalleryChange(galleryImages.filter((_, i) => i !== index));
  };

  const sampleStockPhotos = [
    { label: 'Noore Duo Frame', url: 'https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg' },
    { label: 'Porsche 911 GT3', url: 'https://genuinetask.com.bd/wp-content/uploads/2026/07/df22dd6878b688b871860f01e0537f47_67a337a6-7950-491c-bf04-0b964eb43912-300x225.webp' },
    { label: 'Progress Mindset', url: 'https://genuinetask.com.bd/wp-content/uploads/2026/04/21_043bc097-849b-4b09-96c4-02ce2b6309e1-300x225.webp' },
    { label: 'Ayat-ul-Qursi Set', url: 'https://genuinetask.com.bd/wp-content/uploads/2026/04/634ec5f7-3bad-4e14-8a67-59efdfc99a99-300x225.webp' },
    { label: 'Blue Ocean Frame', url: 'https://genuinetask.com.bd/wp-content/uploads/2026/03/FB_IMG_1723449864046-300x225.webp' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Thumbnail Image */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-600" />
          Primary Product Image
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Image Preview Box */}
          <div className="md:col-span-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              {primaryImage && !imageError ? (
                <Image
                  src={primaryImage}
                  alt="Product Thumbnail Preview"
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageError(false)}
                />
              ) : (
                <div className="text-center p-4 text-gray-400 text-xs">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>No image URL / Invalid</span>
                </div>
              )}
            </div>
          </div>

          {/* Image URL Input & Presets */}
          <div className="md:col-span-8 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Main Image Direct URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/image.jpg"
                value={primaryImage}
                onChange={(e) => {
                  setImageError(false);
                  onPrimaryChange(e.target.value);
                }}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Paste direct URL to JPEG, WebP, or PNG image.
              </p>
            </div>

            {/* Quick Sample Presets */}
            <div>
              <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                Or pick a quick genuine sample photo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleStockPhotos.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setImageError(false);
                      onPrimaryChange(sample.url);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                      primaryImage === sample.url
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Photo Gallery Manager */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Additional Gallery Photos</h3>
            <p className="text-xs text-gray-500">Showcase detail shots, angles, and real-room wall mockups</p>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {galleryImages.length} images
          </span>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {galleryImages.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50"
            >
              <Image src={url} alt={`Gallery item ${idx + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveGalleryImage(idx)}
                className="absolute top-1.5 right-1.5 p-1.5 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md"
                title="Delete photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Gallery Photo Input */}
        <div className="flex gap-2 pt-2">
          <input
            type="url"
            placeholder="Paste additional image URL (e.g. https://...)"
            value={newGalleryUrl}
            onChange={(e) => setNewGalleryUrl(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={handleAddGalleryImage}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add to Gallery
          </button>
        </div>
      </div>
    </div>
  );
}
