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
  Sparkles,
} from 'lucide-react';
import { CustomerReview } from '@/types';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenshotImage, setScreenshotImage] = useState('');
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAdd = () => {
    setScreenshotImage('');
    setCaption('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review photo?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotImage.trim()) {
      alert('Please upload or provide an image');
      return;
    }

    setIsSaving(true);

    const payload: Partial<CustomerReview> = {
      author: caption.trim() || 'Verified Customer',
      rating: 5,
      location: 'Bangladesh',
      productName: caption.trim() || 'Wall Frame',
      comment: caption.trim() || 'Customer feedback proof screenshot',
      screenshotImage: screenshotImage.trim(),
      verified: true,
      featured: true,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setScreenshotImage('');
        setCaption('');
        fetchReviews();
      } else {
        alert(data.error || 'Failed to save review');
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
        title="Review Photos & Screenshots"
        description="Upload customer feedback screenshots and wall photos in their original aspect ratio"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              All Review Photos ({reviews.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Displayed directly on the public /reviews gallery in original size
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/reviews"
              target="_blank"
              className="flex-1 sm:flex-initial text-center px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Public Page
            </Link>

            <button
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-initial px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" /> Upload Review Photo
            </button>
          </div>
        </div>

        {/* Original Ratio Masonry Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">
            Loading review photos...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            No review photos uploaded yet. Click &quot;Upload Review Photo&quot; to add one.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {reviews.map((r) => {
              const displayImg = r.screenshotImage || (r as any).image;
              return (
                <div
                  key={r.id}
                  className="break-inside-avoid bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group relative transition-all hover:shadow-md"
                >
                  {displayImg ? (
                    <div className="relative w-full bg-gray-50">
                      {/* Original Ratio Display */}
                      <img
                        src={displayImg}
                        alt={r.author || 'Customer Review'}
                        className="w-full h-auto object-contain block"
                        loading="lazy"
                      />
                      
                      {/* Delete Overlay Button */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md transition-colors disabled:opacity-50"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Optional Caption Badge */}
                      {r.author && r.author !== 'Verified Customer' && (
                        <div className="p-2.5 bg-white border-t border-gray-100 text-xs font-semibold text-gray-800">
                          {r.author}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      <p className="text-xs text-gray-700 italic">&ldquo;{r.comment}&rdquo;</p>
                      <div className="flex justify-between items-center text-[11px] text-gray-400">
                        <span>{r.author}</span>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Simple Photo Upload Modal */}
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
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Upload Review Photo / Screenshot
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Direct Photo Upload */}
                <FileUploadBox
                  label="Select or Drag Customer Photo / Screenshot"
                  value={screenshotImage}
                  onChange={setScreenshotImage}
                  aspectRatio="wide"
                />

                {/* Optional Caption */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Caption / Customer Note <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Porsche 911 Frame customer wall photo"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !screenshotImage}
                    className="px-5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Uploading...' : 'Save & Publish Photo'}
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
