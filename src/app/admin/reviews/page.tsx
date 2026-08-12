'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminHeader from '@/components/admin/AdminHeader';
import FileUploadBox from '@/components/admin/FileUploadBox';
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  CheckCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { CustomerReview } from '@/types';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);

  // Form State
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [productName, setProductName] = useState('Porsche 911 GT3 RS Edition');
  const [comment, setComment] = useState('');
  const [screenshotImage, setScreenshotImage] = useState('');
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
    setEditingReview(null);
    setAuthor('');
    setRating(5);
    setLocation('Dhaka, Bangladesh');
    setProductName('Porsche 911 GT3 RS Edition');
    setComment('');
    setScreenshotImage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: CustomerReview) => {
    setEditingReview(r);
    setAuthor(r.author);
    setRating(r.rating);
    setLocation(r.location || 'Dhaka, Bangladesh');
    setProductName(r.productName || 'Handcrafted Wall Frame');
    setComment(r.comment);
    setScreenshotImage(r.screenshotImage || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
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
    setIsSaving(true);

    const payload: Partial<CustomerReview> = {
      id: editingReview?.id,
      author,
      rating,
      location,
      productName,
      comment,
      screenshotImage,
      verified: true,
      featured: true,
      date: editingReview?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };

    try {
      const url = editingReview ? `/api/admin/reviews/${editingReview.id}` : '/api/admin/reviews';
      const method = editingReview ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
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
        title="Customer Reviews & Proof Screenshots"
        description="Upload customer feedback screenshots, inbox reviews, and testimonials to display on the public /reviews page"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              All Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-gray-500">
              Published on the pinned Reviews page and homepage testimonials
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
              <Plus className="w-4 h-4" /> Add Review Photo
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-xs text-gray-400">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-gray-500">
              No customer reviews added yet. Click &quot;Add Review Photo&quot; above to create one.
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Screenshot preview if available */}
                {r.screenshotImage && (
                  <div className="relative aspect-[16/10] bg-gray-100 border-b border-gray-100 group">
                    <Image
                      src={r.screenshotImage}
                      alt={r.author}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm">
                      Proof Photo
                    </div>
                  </div>
                )}

                {/* Review Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400">{r.date}</span>
                    </div>

                    <p className="text-xs text-gray-700 italic line-clamp-3">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1">
                          {r.author}
                          <CheckCircle className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          {r.location || 'Dhaka'} • {r.productName || 'Wall Frame'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                          title="Edit review"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create / Edit Review Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4">
              <form
                onSubmit={handleSave}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-5 sm:p-8 space-y-4 animate-slide-up"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">
                    {editingReview ? 'Edit Review & Photo' : 'Upload Customer Review & Screenshot'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Direct Photo Upload or Link */}
                <FileUploadBox
                  label="Customer Review Screenshot / Wall Photo"
                  value={screenshotImage}
                  onChange={setScreenshotImage}
                  aspectRatio="wide"
                />

                {/* Customer Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Md. Rakib Hasan"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dhanmondi, Dhaka"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Product Name & Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Purchased Product
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Porsche 911 GT3 RS Edition"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Rating (Stars)
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black bg-white"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    </select>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Review Text / Customer Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. The frame quality is amazing! Perfect finish and fast delivery."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
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
                    disabled={isSaving}
                    className="px-5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Review'}
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
