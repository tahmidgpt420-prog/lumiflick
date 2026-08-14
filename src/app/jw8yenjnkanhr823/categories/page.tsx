'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminHeader from '@/components/admin/AdminHeader';
import FileUploadBox from '@/components/admin/FileUploadBox';
import { Plus, Edit2, Layers, Check, ExternalLink, Trash2, CornerDownRight, FolderTree } from 'lucide-react';
import { Category } from '@/types';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { categories as staticCategories } from '@/data/categories';

export default function AdminCategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentSlug, setParentSlug] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const { refreshProducts } = useProducts();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // The authenticated admin API merges JSON store + Firestore + static
      // and always reflects a save immediately.
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load categories');
      setCategoriesList(data.categories);
    } catch (e) {
      console.error('Error fetching categories:', e);
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
    setParentSlug(cat.parentSlug || cat.parentId || '');
    setImage(cat.image);
    setDescription(cat.description || '');
    setShowOnHomepage(Boolean(cat.showOnHomepage));
  };

  const handleNewClick = (defaultParentSlug = '') => {
    setEditingCategory({ name: '', slug: '', image: '', description: '', parentSlug: defaultParentSlug });
    setName('');
    setSlug('');
    setParentSlug(defaultParentSlug);
    setImage('https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.46.39-AM.webp');
    setDescription('');
    setShowOnHomepage(false);
  };

  const handleDeleteClick = async (catSlug: string) => {
    if (!confirm(`Are you sure you want to delete category "${catSlug}"?`)) return;
    setDeletingSlug(catSlug);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: catSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete category');
      try {
        await refreshProducts();
      } catch {}
      await fetchCategories();
    } catch (err: any) {
      alert('Failed to delete category: ' + (err?.message || 'Unknown error'));
    } finally {
      setDeletingSlug(null);
    }
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
        parentSlug: parentSlug.trim() || null,
        parentId: parentSlug.trim() || null,
        showOnHomepage,
      };

      // 1. Save via the authenticated admin API (JSON store + Firestore mirror server-side)
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...categoryData, oldSlug: editingCategory?.slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save category');

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

  // Main Categories (those with NO parent)
  const mainCategories = categoriesList.filter((c) => !c.parentSlug && !c.parentId);

  // Helper to find sub-categories for a parent
  const getSubcategories = (pSlug: string) =>
    categoriesList.filter((c) => c.parentSlug === pSlug || c.parentId === pSlug);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Category & Sub-Category Management"
        description="Organize main collections and child sub-categories with custom thumbnails and descriptions"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-600" />
              All Collections ({categoriesList.length} total, {mainCategories.length} main)
            </h2>
            <p className="text-xs text-gray-500">Organized by Main Collections &amp; their Sub-Categories</p>
          </div>
          <button
            onClick={() => handleNewClick()}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* Categories Structured Tree / Grid */}
        <div className="space-y-6">
          {mainCategories.map((mainCat) => {
            const subs = getSubcategories(mainCat.slug);
            return (
              <div key={mainCat.slug} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-4">
                {/* Main Category Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      <Image src={mainCat.image || '/logo.png'} alt={mainCat.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{mainCat.name}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold">
                          Main Collection
                        </span>
                        {mainCat.showOnHomepage && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                            On Homepage
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-mono">/{mainCat.slug}</span>
                      {subs.length > 0 && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{subs.length} sub-categor{subs.length === 1 ? 'y' : 'ies'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleNewClick(mainCat.slug)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 border border-amber-200"
                    >
                      <Plus className="w-3 h-3" /> Add Sub-Category
                    </button>
                    <Link
                      href={`/product-category/${mainCat.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
                      title="View live category page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEditClick(mainCat)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(mainCat.slug)}
                      disabled={deletingSlug === mainCat.slug}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-categories List (if any) */}
                {subs.length > 0 && (
                  <div className="pl-4 sm:pl-8 space-y-2 border-l-2 border-amber-200/60 ml-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Sub-categories of {mainCat.name}:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subs.map((subCat) => (
                        <div
                          key={subCat.slug}
                          className="bg-gray-50 rounded-xl border border-gray-200/80 p-3 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CornerDownRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-200">
                              <Image src={subCat.image || '/logo.png'} alt={subCat.name} fill className="object-cover" sizes="40px" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 truncate">{subCat.name}</h4>
                              <p className="text-[10px] text-gray-400 font-mono truncate">/{subCat.slug}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Link
                              href={`/product-category/${subCat.slug}`}
                              target="_blank"
                              className="p-1 text-gray-400 hover:text-black rounded"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleEditClick(subCat)}
                              className="p-1 text-gray-600 hover:text-black hover:bg-gray-200 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(subCat.slug)}
                              disabled={deletingSlug === subCat.slug}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Edit / Create Modal */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <form
                onSubmit={handleSave}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 animate-slide-up"
              >
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                  {editingCategory.name ? `Edit Category "${editingCategory.name}"` : 'Add New Category'}
                </h3>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dragon Ball"
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
                    placeholder="e.g. dragon-ball"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black bg-gray-50"
                  />
                </div>

                {/* Parent Category Selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Parent Category (Hierarchy)
                  </label>
                  <select
                    value={parentSlug}
                    onChange={(e) => setParentSlug(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black bg-white"
                  >
                    <option value="">None (Top-Level Main Category)</option>
                    {mainCategories
                      .filter((c) => c.slug !== slug) // Avoid circular parenting
                      .map((c) => (
                        <option key={c.slug} value={c.slug}>
                          Sub-category of: {c.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Choose a parent to make this category a sub-category under it.
                  </p>
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
                    placeholder="Short description for collection banners & SEO"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 pt-1">
                  <input
                    type="checkbox"
                    checked={showOnHomepage}
                    onChange={(e) => setShowOnHomepage(e.target.checked)}
                    className="w-4 h-4 accent-black rounded"
                  />
                  Show this category as a section on the homepage
                </label>

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
