'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon, Check, Loader2, ArrowRight } from 'lucide-react';
import { formatImageUrl } from '@/utils/driveUrl';
import { compressImage } from '@/utils/imageCompressor';

interface FileUploadBoxProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  skipCompression?: boolean;
}

export default function FileUploadBox({
  value,
  onChange,
  label = 'Product / Review Photo',
  aspectRatio = 'wide',
  maxWidth,
  maxHeight,
  quality,
  skipCompression = false,
}: FileUploadBoxProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [linkInput, setLinkInput] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLinkInput(value || '');
  }, [value]);

  const handleApplyLink = () => {
    const formatted = formatImageUrl(linkInput.trim(), 'original');
    if (formatted) {
      onChange(formatted);
    }
  };

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    setIsUploading(true);

    try {
      let finalDataUrl = '';

      if (skipCompression) {
        // Read file as raw base64
        const rawBase64 = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target?.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
        finalDataUrl = rawBase64;
        onChange(rawBase64);
      } else {
        // Smart High-Resolution compression
        const resolvedMaxWidth = maxWidth || (aspectRatio === 'wide' ? 3840 : 2560);
        const resolvedMaxHeight = maxHeight || (aspectRatio === 'wide' ? 2160 : 2560);
        const resolvedQuality = quality || (aspectRatio === 'wide' ? 0.95 : 0.90);

        const { compressedBase64 } = await compressImage(file, {
          maxWidth: resolvedMaxWidth,
          maxHeight: resolvedMaxHeight,
          quality: resolvedQuality,
        });

        finalDataUrl = compressedBase64;
        onChange(compressedBase64);
      }

      // 2. Upload to server
      const formData = new FormData();
      const resBlob = await fetch(finalDataUrl).then((r) => r.blob());
      const ext = file.name.split('.').pop() || 'webp';
      const compressedFile = new File([resBlob], file.name.replace(/\.[^/.]+$/, '') + `.${ext}`, {
        type: resBlob.type || file.type || 'image/webp',
      });

      formData.append('file', compressedFile);

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
            onError={(e) => {
              // If image failed to load, show subtle broken link badge
              (e.target as HTMLElement).style.opacity = '0.5';
            }}
          />
          <button
            type="button"
            onClick={() => {
              onChange('');
              setLinkInput('');
            }}
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
        /* Direct Link Input with Apply button & Enter key support */
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste public image link or Google Drive link (https://...)"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyLink();
                }
              }}
              className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              Attach Link <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Paste any direct image URL, Google Drive link, Imgur, or cloud link, then click <strong>Attach Link</strong> or press Enter.
          </p>
        </div>
      )}
    </div>
  );
}
