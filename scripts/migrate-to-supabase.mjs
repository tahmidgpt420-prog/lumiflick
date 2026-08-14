#!/usr/bin/env node
/**
 * One-time migration: pulls the current live catalog (via the already-
 * correct merged admin API endpoints — static + JSON store + Firestore,
 * deduped and tombstone-filtered) and writes it into Supabase.
 *
 * Safe to re-run — every insert is an upsert keyed by primary key.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-to-supabase.mjs
 *
 * By default reads from the LIVE production site (https://www.lumiflick.shop)
 * since that's the definitive current dataset. Override with SOURCE_URL env
 * var to point at a local dev server instead.
 */
import { createClient } from '@supabase/supabase-js';

const SOURCE_URL = process.env.SOURCE_URL || 'https://www.lumiflick.shop';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.argv[2];

if (!ADMIN_PASSWORD) {
  console.error('Usage: node --env-file=.env.local scripts/migrate-to-supabase.mjs <admin-password>');
  process.exit(1);
}

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_USERNAME'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing env vars:', missing.join(', '));
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// --- Log in to the source site and grab a session cookie ---
let cookie = '';
{
  const res = await fetch(`${SOURCE_URL}/api/admin/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    console.error('Login to source site failed:', data.error || res.status);
    process.exit(1);
  }
  cookie = res.headers.get('set-cookie')?.split(';')[0] || '';
  console.log('✔ Logged in to', SOURCE_URL);
}

async function fetchJson(path) {
  const res = await fetch(`${SOURCE_URL}${path}`, { headers: { Cookie: cookie } });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(`${path} failed: ${data.error || res.status}`);
  return data;
}

// --- Products ---
{
  const { products } = await fetchJson('/api/admin/products');
  console.log(`Fetched ${products.length} products`);
  const rows = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    category_slug: p.categorySlug,
    price: p.price,
    regular_price: p.regularPrice ?? null,
    price_range: p.priceRange ?? null,
    image: p.image ?? null,
    gallery_images: p.galleryImages ?? [],
    sale: p.sale ?? true,
    featured: p.featured ?? false,
    best_seller: p.bestSeller ?? false,
    short_description: p.shortDescription ?? null,
    description: p.description ?? null,
    specifications: p.specifications ?? null,
    variations: p.variations ?? [],
    rating: p.rating ?? null,
    review_count: p.reviewCount ?? null,
    tags: p.tags ?? [],
    piece_selection_enabled: p.pieceSelectionEnabled ?? false,
    max_pieces: p.maxPieces ?? 3,
    updated_at: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
  }));

  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) throw new Error(`products upsert failed: ${error.message}`);
    console.log(`  upserted products ${i + 1}-${i + chunk.length}`);
  }
}

// --- Categories ---
{
  const { categories } = await fetchJson('/api/admin/categories');
  console.log(`Fetched ${categories.length} categories`);
  const rows = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    image: c.image ?? null,
    description: c.description ?? null,
    parent_slug: c.parentSlug || c.parentId || null,
    show_on_homepage: c.showOnHomepage ?? false,
  }));
  const { error } = await supabase.from('categories').upsert(rows, { onConflict: 'slug' });
  if (error) throw new Error(`categories upsert failed: ${error.message}`);
  console.log('✔ Categories migrated');
}

// --- Banners ---
{
  const { banners } = await fetchJson('/api/admin/banners');
  console.log(`Fetched ${banners.length} banners`);
  const rows = banners.map((b) => ({
    id: b.id,
    image: b.image,
    link: b.link,
    title: b.title ?? null,
    subtitle: b.subtitle ?? null,
    button_text: b.buttonText ?? null,
    badge: b.badge ?? null,
    display_order: b.order ?? 1,
    is_active: b.isActive ?? true,
  }));
  if (rows.length) {
    const { error } = await supabase.from('banners').upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`banners upsert failed: ${error.message}`);
  }
  console.log('✔ Banners migrated');
}

// --- Reviews ---
{
  const { reviews } = await fetchJson('/api/admin/reviews');
  console.log(`Fetched ${reviews.length} reviews`);
  const rows = reviews.map((r) => ({
    id: r.id,
    author: r.author ?? null,
    rating: r.rating ?? 5,
    review_date: r.date ?? null,
    verified: r.verified ?? true,
    comment: r.comment ?? null,
    product_name: r.productName ?? null,
    location: r.location ?? null,
    screenshot_image: r.screenshotImage ?? null,
    featured: r.featured ?? true,
  }));
  if (rows.length) {
    const { error } = await supabase.from('reviews').upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`reviews upsert failed: ${error.message}`);
  }
  console.log('✔ Reviews migrated');
}

// --- Settings ---
{
  const { settings } = await fetchJson('/api/admin/settings');
  const row = {
    id: 1,
    store_name: settings.storeName ?? null,
    phone: settings.phone ?? null,
    email: settings.email ?? null,
    address: settings.address ?? null,
    inside_dhaka_delivery: settings.insideDhakaDelivery ?? null,
    outside_dhaka_delivery: settings.outsideDhakaDelivery ?? null,
    promo_notice: settings.promoNotice ?? null,
    header_scripts: settings.headerScripts ?? null,
    body_scripts: settings.bodyScripts ?? null,
    footer_scripts: settings.footerScripts ?? null,
    frame_effect_before_image: settings.frameEffectBeforeImage ?? null,
    frame_effect_after_image: settings.frameEffectAfterImage ?? null,
  };
  const { error } = await supabase.from('settings').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`settings upsert failed: ${error.message}`);
  console.log('✔ Settings migrated');
}

// --- Orders ---
{
  const { orders } = await fetchJson('/api/admin/orders');
  console.log(`Fetched ${orders.length} orders`);
  const rows = orders.map((o) => ({
    order_id: o.orderId,
    customer_name: o.customerName ?? null,
    phone: o.phone ?? null,
    email: o.email ?? null,
    address: o.address ?? null,
    city: o.city ?? null,
    delivery_zone: o.deliveryZone ?? null,
    shipping_cost: o.shippingCost ?? null,
    payment_method: o.paymentMethod ?? null,
    items: o.items ?? [],
    subtotal: o.subtotal ?? null,
    total: o.total ?? null,
    order_date: o.orderDate ?? null,
    notes: o.notes ?? null,
    status: o.status ?? 'pending',
  }));
  if (rows.length) {
    const { error } = await supabase.from('orders').upsert(rows, { onConflict: 'order_id' });
    if (error) throw new Error(`orders upsert failed: ${error.message}`);
  }
  console.log('✔ Orders migrated');
}

console.log('\n✔ Migration complete.');
process.exit(0);
