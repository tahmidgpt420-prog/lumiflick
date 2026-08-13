'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductVariation, Category } from '@/types';
import { categories as initialCategories } from '@/data/categories';
import { saveProductToFirestore } from '@/lib/firestoreProducts';
import { useProducts } from '@/context/ProductContext';
import ImageGalleryPicker from './ImageGalleryPicker';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  FileText,
  Settings,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: Product;
  isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const { refreshProducts } = useProducts();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'Best Selling');
  const [price, setPrice] = useState<number>(initialData?.price || 1250);
  const [regularPrice, setRegularPrice] = useState<number>(
    initialData?.regularPrice || 1650
  );
  const [sale, setSale] = useState<boolean>(initialData?.sale ?? true);
  const [featured, setFeatured] = useState<boolean>(initialData?.featured ?? false);
  const [bestSeller, setBestSeller] = useState<boolean>(initialData?.bestSeller ?? false);
  const [pieceSelectionEnabled, setPieceSelectionEnabled] = useState<boolean>(initialData?.pieceSelectionEnabled ?? false);
  const [maxPieces, setMaxPieces] = useState<number>(initialData?.maxPieces ?? 3);
  const [catList, setCatList] = useState<Category[]>(initialCategories);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCatList(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories in ProductForm:', err);
      }
    }
    loadCats();
  }, []);

  const [primaryImage, setPrimaryImage] = useState<string>(
    initialData?.image ||
      'https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg'
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.galleryImages || [
      'https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg',
    ]
  );

  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription ||
      'Handcrafted luxury wall art printed on archival UV matte textured composite.'
  );
  const [description, setDescription] = useState(
    initialData?.description ||
      '<p>Transform any blank wall into a sophisticated statement with LUMIFLICK.</p>'
  );

  const [variations, setVariations] = useState<ProductVariation[]>(
    initialData?.variations || [
      {
        size: 'Small (Set of 3: 13″ x 9″ each)',
        label: 'Small: 13″ x 9″ (each) – Set of 3',
        price: 1250,
        regularPrice: 1650,
        inStock: true,
      },
      {
        size: 'Medium (Set of 3: 17″ x 13″ each)',
        label: 'Medium: 17″ x 13″ (each) – Set of 3',
        price: 2450,
        regularPrice: 3200,
        inStock: true,
      },
      {
        size: 'Large (Set of 3: 25″ x 17″ each)',
        label: 'Large: 25″ x 17″ (each) – Set of 3',
        price: 3850,
        regularPrice: 4800,
        inStock: true,
      },
    ]
  );

  const [specifications, setSpecifications] = useState({
    material:
      initialData?.specifications?.material ||
      'High-grade Korean Synthetic Wood Composite',
    finish:
      initialData?.specifications?.finish ||
      'Anti-glare UV Textured Matte Lamination (No Glass break hazard)',
    mounting:
      initialData?.specifications?.mounting ||
      'Pre-installed heavy-duty sawtooth hanger + wall hooks included',
    dimensions:
      initialData?.specifications?.dimensions ||
      'Small: 13″ x 9″ | Medium: 17″ x 13″ | Large: 25″ x 17″',
    weight: initialData?.specifications?.weight || '1.2 kg - 2.8 kg',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Auto-generate slug from title if creating
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  // Add variation
  const handleAddVariation = () => {
    setVariations([
      ...variations,
      {
        size: `Custom Option ${variations.length + 1}`,
        label: `Custom Size (${variations.length + 1})`,
        price: price,
        regularPrice: Math.round(price * 1.3),
        inStock: true,
      },
    ]);
  };

  // Update variation
  const handleUpdateVariation = (
    index: number,
    field: keyof ProductVariation,
    value: any
  ) => {
    const next = [...variations];
    next[index] = { ...next[index], [field]: value };
    setVariations(next);
  };

  // Remove variation
  const handleRemoveVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    // Compute category slug
    const selectedCatObj = catList.find((c) => c.name === category);
    const categorySlug =
      selectedCatObj?.slug ||
      category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const isBestSelling =
      category.toLowerCase() === 'best selling' ||
      categorySlug === 'best-selling' ||
      bestSeller;
    const finalCategorySlug =
      category.toLowerCase() === 'best selling' ? 'best-selling' : categorySlug;

    const minPrice = variations.length > 0 ? Math.min(...variations.map((v) => v.price)) : price;
    const maxPrice = variations.length > 0 ? Math.max(...variations.map((v) => v.price)) : price;
    const priceRange =
      minPrice === maxPrice
        ? `৳ ${minPrice.toLocaleString()}`
        : `৳ ${minPrice.toLocaleString()} - ৳ ${maxPrice.toLocaleString()}`;

    const payload: Partial<Product> = {
      id: initialData?.id,
      title,
      slug,
      category,
      categorySlug: finalCategorySlug,
      price: minPrice,
      regularPrice,
      priceRange,
      image: primaryImage,
      galleryImages,
      sale,
      featured,
      bestSeller: isBestSelling,
      shortDescription,
      description,
      variations,
      pieceSelectionEnabled,
      maxPieces: pieceSelectionEnabled ? maxPieces : undefined,
      specifications: {
        ...specifications,
        frameColorOptions: [
          'Matte Black',
          'Luxury Gold',
          'Natural Walnut Wood',
          'Minimalist White',
        ],
      },
    };

    try {
      const localProduct: Product = {
        ...payload,
        id: payload.id || `prod_${slug}_${Date.now()}`,
      } as Product;

      // 1. Save to Firestore (universal source of truth)
      await saveProductToFirestore(localProduct);

      // 2. Refresh client cache
      try {
        await refreshProducts();
      } catch {}

      // 3. Best-effort API sync (non-fatal)
      try {
        const url = isEditing && initialData?.id
          ? `/api/admin/products/${initialData.id}`
          : '/api/admin/products';
        const method = isEditing ? 'PUT' : 'POST';
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localProduct),
        });
      } catch (_apiErr) {
        // Silently ignore — Firestore is the source of truth
      }

      setStatusMessage({
        type: 'success',
        text: isEditing ? 'Product updated successfully!' : 'Product created successfully!',
      });
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error saving product.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {(slug || initialData?.slug) && (
            <Link
              href={`/product/${slug || initialData?.slug}`}
              target="_blank"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
            >
              View Live Page
            </Link>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-black/10 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <FileText className="w-4 h-4 text-amber-600" />
          Product Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Porsche 911 GT3 RS Edition"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-black font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="porsche-911-gt3-rs-edition"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black text-gray-600 bg-gray-50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black bg-white"
            >
              {catList.map((cat) => (
                <option key={cat.slug || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Base Price (৳ BDT) <span className="text-red-500">*</span>
              <span className="ml-1 text-[10px] text-gray-400 font-normal">(syncs to Size Options below)</span>
            </label>
            <input
              type="number"
              required
              min={1}
              value={price}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPrice(val);
                // Sync all variations price proportionally (replace uniform ones)
                setVariations((prev) => prev.map((v) => ({ ...v, price: val })));
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Regular Price (৳ BDT — Strike-through shown on page)
              <span className="ml-1 text-[10px] text-gray-400 font-normal">(syncs to Size Options below)</span>
            </label>
            <input
              type="number"
              min={1}
              value={regularPrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRegularPrice(val);
                // Sync all variations regularPrice so the live page shows updated strike-through
                setVariations((prev) => prev.map((v) => ({ ...v, regularPrice: val })));
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black text-gray-500"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 pt-3 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={sale}
              onChange={(e) => setSale(e.target.checked)}
              className="w-4 h-4 accent-black rounded"
            />
            Show &ldquo;Sale!&rdquo; Badge
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={bestSeller}
              onChange={(e) => setBestSeller(e.target.checked)}
              className="w-4 h-4 accent-black rounded"
            />
            Feature on Best Sellers Section
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-black rounded"
            />
            Featured Product
          </label>

          {/* Piece Selection Toggle */}
          <div className="w-full pt-3 border-t border-gray-100 mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={pieceSelectionEnabled}
                onChange={(e) => setPieceSelectionEnabled(e.target.checked)}
                className="w-4 h-4 accent-black rounded"
              />
              Allow Piece Selection (customer picks 1, 2, or 3 pieces)
            </label>
            {pieceSelectionEnabled && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-600">Max pieces customer can select:</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMaxPieces(n)}
                      className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${
                        maxPieces === n
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-gray-400">piece{maxPieces > 1 ? 's' : ''} max</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Image Management */}
      <ImageGalleryPicker
        primaryImage={primaryImage}
        galleryImages={galleryImages}
        onPrimaryChange={setPrimaryImage}
        onGalleryChange={setGalleryImages}
      />

      {/* 3. Variations & Sizes Manager */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Size Options & Pricing Variations
            </h3>
            <p className="text-xs text-gray-500">
              Customers can pick between sizes with individual pricing on the product page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddVariation}
            className="px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Size Option
          </button>
        </div>

        <div className="space-y-3">
          {variations.map((v, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col md:flex-row items-start md:items-center gap-3"
            >
              <div className="flex-1 w-full">
                <label className="text-[11px] font-semibold text-gray-500 block mb-0.5">
                  Size Identifier
                </label>
                <input
                  type="text"
                  value={v.size}
                  onChange={(e) => handleUpdateVariation(idx, 'size', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-black"
                />
              </div>

              <div className="flex-1 w-full">
                <label className="text-[11px] font-semibold text-gray-500 block mb-0.5">
                  Display Label
                </label>
                <input
                  type="text"
                  value={v.label}
                  onChange={(e) => handleUpdateVariation(idx, 'label', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-black"
                />
              </div>

              <div className="w-full md:w-28">
                <label className="text-[11px] font-semibold text-gray-500 block mb-0.5">
                  Price (৳)
                </label>
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => handleUpdateVariation(idx, 'price', Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-black font-bold"
                />
              </div>

              <div className="w-full md:w-28">
                <label className="text-[11px] font-semibold text-gray-500 block mb-0.5">
                  Regular Price (৳)
                </label>
                <input
                  type="number"
                  value={v.regularPrice}
                  onChange={(e) => handleUpdateVariation(idx, 'regularPrice', Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:border-black text-gray-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveVariation(idx)}
                className="text-red-500 hover:text-red-700 p-2 md:mt-4 self-end md:self-auto"
                title="Remove size option"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Descriptions */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
          Descriptions & Marketing Copy
        </h3>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Short Summary (Shown right next to the buy button)
          </label>
          <textarea
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Detailed Description (HTML / Full Description Tab)
          </label>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-mono outline-none focus:border-black"
          />
        </div>
      </div>

      {/* 5. Specifications */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Settings className="w-4 h-4 text-amber-600" />
          Physical Specifications & Mounting
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Frame Material
            </label>
            <input
              type="text"
              value={specifications.material}
              onChange={(e) => setSpecifications({ ...specifications, material: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Surface Finish
            </label>
            <input
              type="text"
              value={specifications.finish}
              onChange={(e) => setSpecifications({ ...specifications, finish: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Mounting Hardware
            </label>
            <input
              type="text"
              value={specifications.mounting}
              onChange={(e) => setSpecifications({ ...specifications, mounting: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Package Weight
            </label>
            <input
              type="text"
              value={specifications.weight}
              onChange={(e) => setSpecifications({ ...specifications, weight: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-black/10 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : isEditing ? 'Save All Changes' : 'Publish New Product'}
        </button>
      </div>
    </form>
  );
}
