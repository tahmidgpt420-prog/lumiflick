'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Image as ImageIcon, UploadCloud, Loader2 } from 'lucide-react';
import FileUploadBox from './FileUploadBox';
import { formatImageUrl } from '@/utils/driveUrl';
import { compressImage } from '@/utils/imageCompressor';

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
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddGalleryImage = () => {
    const formatted = formatImageUrl(newGalleryUrl.trim());
    if (!formatted) return;
    if (!galleryImages.includes(formatted)) {
      onGalleryChange([...galleryImages, formatted]);
    }
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    onGalleryChange(galleryImages.filter((_, i) => i !== index));
  };

  const handleGalleryFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploadingGallery(true);
    try {
      // 1. Compress image client-side before upload
      const { compressedBase64 } = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
      });

      const resBlob = await fetch(compressedBase64).then((r) => r.blob());
      const compressedFile = new File([resBlob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
        type: resBlob.type || 'image/webp',
      });

      const formData = new FormData();
      formData.append('file', compressedFile);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onGalleryChange([...galleryImages, data.url]);
      } else {
        // Fallback to compressed Base64 Data URL if server upload returns fallback
        onGalleryChange([...galleryImages, compressedBase64]);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Thumbnail Image with Upload & Link */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <FileUploadBox
          label="Primary Product Image (Main Display & Catalog Thumbnail)"
          value={primaryImage}
          onChange={onPrimaryChange}
          aspectRatio="wide"
        />
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

        {/* Upload or Link to Gallery */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <input
            ref={galleryFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleGalleryFileUpload(e.target.files[0]);
              }
            }}
          />

          <button
            type="button"
            onClick={() => galleryFileInputRef.current?.click()}
            disabled={isUploadingGallery}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            {isUploadingGallery ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            Upload Photo to Gallery
          </button>

          <div className="flex-1 flex gap-2">
            <input
              type="url"
              placeholder="Or paste image URL: https://..."
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleAddGalleryImage}
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
