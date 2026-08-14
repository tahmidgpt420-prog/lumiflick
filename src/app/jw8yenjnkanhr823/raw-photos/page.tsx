'use client';

import React, { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import FileUploadBox from '@/components/admin/FileUploadBox';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  X,
  Camera,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { RawPhoto } from '@/types';
import { formatImageUrl } from '@/utils/driveUrl';
import Link from 'next/link';

export default function AdminRawPhotosPage() {
  const [photos, setPhotos] = useState<RawPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [directLinkInput, setDirectLinkInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/admin/raw-photos');
      const data = await res.json();
      if (data.success && Array.isArray(data.photos)) {
        setPhotos(data.photos);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleOpenAdd = () => {
    setPhotoUrl('');
    setDirectLinkInput('');
    setIsModalOpen(true);
  };

  const handleApplyLink = () => {
    if (!directLinkInput.trim()) return;
    const formatted = formatImageUrl(directLinkInput.trim());
    setPhotoUrl(formatted);
    setDirectLinkInput('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this raw photo?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/raw-photos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = (photoUrl || directLinkInput).trim();
    if (!finalUrl) {
      alert('Please upload or provide an image link');
      return;
    }

    setIsSaving(true);

    const formatted = formatImageUrl(finalUrl);
    const payload: Partial<RawPhoto> = {
      image: formatted,
      displayOrder: photos.length + 1,
    };

    try {
      const res = await fetch('/api/admin/raw-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setPhotoUrl('');
        setDirectLinkInput('');
        fetchPhotos();
      } else {
        alert(data.error || 'Failed to save photo');
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
        title="Raw Product Photos"
        description="Add and manage unfiltered raw photos and gallery shots in their true original aspect ratio"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-600" />
              All Raw Photos ({photos.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Displayed directly on the public /raw-photos showcase page in original ratio
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/raw-photos"
              target="_blank"
              className="flex-1 sm:flex-initial text-center px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Page
            </Link>

            <button
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-initial px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Raw Photo
            </button>
          </div>
        </div>

        {/* Original Ratio Masonry Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            Loading raw photos...
          </div>
        ) : photos.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
              <Camera className="w-6 h-6" />
            </div>
            <p className="font-semibold text-gray-700">No raw photos added yet</p>
            <p className="text-gray-400">Click &quot;Add Raw Photo&quot; to paste a photo link or upload an image.</p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Your First Photo
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((p) => {
              const displayImg = formatImageUrl(p.image);
              return (
                <div
                  key={p.id}
                  className="break-inside-avoid bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group relative transition-all hover:shadow-md"
                >
                  <div className="relative w-full bg-gray-50">
                    {/* Original Ratio Display */}
                    <img
                      src={displayImg}
                      alt="Raw Product Photo"
                      className="w-full h-auto object-contain block"
                      loading="lazy"
                    />
                    
                    {/* Delete Overlay Button */}
                    <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg transition-colors disabled:opacity-50"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Photo Upload / Link Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4">
              <form
                onSubmit={handleSave}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 animate-slide-up"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-600" />
                    Add Raw Photo
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Direct Link Input Section */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-amber-600" />
                    Paste Direct Photo Link (Google Drive / Imgur / URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={directLinkInput}
                      onChange={(e) => setDirectLinkInput(e.target.value)}
                      placeholder="https://drive.google.com/file/d/... or image URL"
                      className="flex-1 px-3.5 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-black transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleApplyLink}
                      className="px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                    >
                      Use Link
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Supports Google Drive share links, Imgur, Dropbox, or any direct image URL.
                  </p>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-gray-400">OR UPLOAD</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Direct File Upload */}
                <FileUploadBox
                  label="Select or Drag Raw Image"
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  aspectRatio="wide"
                />

                {/* Live Preview */}
                {photoUrl && (
                  <div className="p-2 bg-gray-50 rounded-2xl border border-gray-200 max-h-48 overflow-hidden flex items-center justify-center">
                    <img
                      src={formatImageUrl(photoUrl)}
                      alt="Preview"
                      className="max-h-44 w-auto object-contain rounded-lg"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || (!photoUrl && !directLinkInput)}
                    className="flex-1 py-3 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Photo'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
