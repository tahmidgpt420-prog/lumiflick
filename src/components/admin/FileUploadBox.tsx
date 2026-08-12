'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { formatImageUrl } from '@/utils/driveUrl';

interface FileUploadBoxProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

export default function FileUploadBox({
  value,
  onChange,
  label = 'Product / Review Photo',
  aspectRatio = 'wide',
}: FileUploadBoxProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Instant local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // 2. Upload to server
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'aspect-[16/10]'
      : 'aspect-[4/3]';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-800">{label}</label>
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
              tab === 'upload' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            <UploadCloud className="w-3 h-3" /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
              tab === 'url' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            <LinkIcon className="w-3 h-3" /> Image Link
          </button>
        </div>
      </div>

      {/* Preview if image exists */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 group flex items-center justify-center p-2">
          <img
            src={value}
            alt="Uploaded preview"
            className="max-h-80 w-auto max-w-full object-contain rounded-xl"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-3 right-3 p-1.5 bg-black/80 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Remove Photo"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold rounded-lg flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" /> Photo Attached
          </div>
        </div>
      ) : tab === 'upload' ? (
        /* Drag and Drop File Upload Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-black bg-gray-50 scale-[0.99]'
              : 'border-gray-300 hover:border-black hover:bg-gray-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                {isUploading ? 'Uploading Image...' : 'Click to Upload or Drag & Drop'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Supports PNG, JPG, JPEG, WEBP from your phone or PC
              </p>
            </div>
            <button
              type="button"
              className="px-3.5 py-1.5 bg-black text-white text-[11px] font-bold rounded-xl hover:bg-gray-800 shadow-sm"
            >
              Browse Files
            </button>
          </div>
        </div>
      ) : (
        /* Direct Link Input */
        <div className="space-y-1.5">
          <input
            type="url"
            placeholder="Paste image link or Google Drive link (e.g. https://drive.google.com/...)"
            value={value}
            onChange={(e) => onChange(formatImageUrl(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
          />
          <p className="text-[11px] text-gray-400">
            Paste any direct image link or Google Drive link (make sure sharing is set to &ldquo;Anyone with the link&rdquo;).
          </p>
        </div>
      )}
    </div>
  );
}
