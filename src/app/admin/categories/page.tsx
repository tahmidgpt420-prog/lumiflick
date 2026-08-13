'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminHeader from '@/components/admin/AdminHeader';
import FileUploadBox from '@/components/admin/FileUploadBox';
import { Plus, Edit2, Layers, Check, ExternalLink } from 'lucide-react';
import { Category } from '@/types';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import {
  saveCategoryToFirestore,
  getAllCategoriesFromFirestore,
  deleteCategoryFromFirestore,
} from '@/lib/firestoreProducts';
import { categories as staticCategories } from '@/data/categories';

export default function AdminCategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { refreshProducts } = useProducts();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const firestoreCats = await getAllCategoriesFromFirestore();
      if (firestoreCats && firestoreCats.length > 0) {
        const firestoreSlugs = new Set(firestoreCats.map((c) => c.slug));
        const staticOnly = staticCategories.filter((c) => !firestoreSlugs.has(c.slug));
        setCategoriesList([...firestoreCats, ...staticOnly]);
      } else {
        setCategoriesList(staticCategories);
      }
    } catch (e) {
      console.error('Error fetching categories from Firestore:', e);
      setCategoriesList(staticCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setImage(cat.image);
    setDescription(cat.description || '');
  };

  const handleNewClick = () => {
    setEditingCategory({ name: '', slug: '', image: '', description: '' });
    setName('');
    setSlug('');
    setImage('https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.46.39-AM.webp');
    setDescription('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setIsSaving(true);
    try {
      const categoryData: Category = {
        name: name.trim(),
        slug: slug.trim(),
        image: image.trim() || '/logo.png',
        description: description.trim(),
      };

      // 1. Direct Firestore write from client (fast & persistent)
      await saveCategoryToFirestore(categoryData);

      // 2. Refresh global cache across the entire app
      try {
        await refreshProducts();
      } catch (err) {
        console.warn('Cache refresh error:', err);
      }

      // 3. Refresh the local list and close modal
      await fetchCategories();
      setEditingCategory(null);
    } catch (e: any) {
      console.error('Error saving category:', e);
      alert('Failed to save category: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Category Showcase Management"
        description="Organize collections, customize category thumbnail banners and descriptions"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-gray-900">All Collections ({categoriesList.length})</h2>
            <p className="text-xs text-gray-500">Categories displayed across navigation and sliders</p>
          </div>
          <button
            onClick={handleNewClick}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesList.map((cat) => (
            <div
              key={cat.slug}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 flex gap-4 items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">{cat.name}</h3>
                  <span className="text-[11px] text-gray-400">/{cat.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/product-category/${cat.slug}`}
                  target="_blank"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleEditClick(cat)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <form
                onSubmit={handleSave}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 animate-slide-up"
              >
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                  {name ? `Edit Category "${name}"` : 'Add New Category'}
                </h3>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingCategory.name) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black bg-gray-50"
                  />
                </div>

                <FileUploadBox
                  label="Category Thumbnail / Banner Image"
                  value={image}
                  onChange={setImage}
                  aspectRatio="square"
                />

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Category'}
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
