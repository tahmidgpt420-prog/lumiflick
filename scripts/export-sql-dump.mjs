import fs from 'fs';
import path from 'path';

const backup = JSON.parse(fs.readFileSync('./supabase_backup_complete.json', 'utf8'));

let sql = `-- ==========================================================================\n`;
sql += `-- LUMIFLICK SUPABASE 100% COMPLETE DATABASE BACKUP & RESTORE DUMP\n`;
sql += `-- Timestamp: ${backup.backup_metadata.timestamp}\n`;
sql += `-- Categories: ${backup.categories.length}\n`;
sql += `-- Products: ${backup.products.length}\n`;
sql += `-- ==========================================================================\n\n`;

// 1. Categories
sql += `-- 1. RESTORE CATEGORIES (${backup.categories.length} rows)\n`;
for (const c of backup.categories) {
  const slug = (c.slug || '').replace(/'/g, "''");
  const name = (c.name || '').replace(/'/g, "''");
  const img = (c.image || '').replace(/'/g, "''");
  const desc = (c.description || '').replace(/'/g, "''");
  const pSlug = c.parent_slug ? `'${c.parent_slug.replace(/'/g, "''")}'` : 'NULL';
  const showH = c.show_on_homepage ? 'TRUE' : 'FALSE';
  const ord = c.display_order !== null && c.display_order !== undefined ? c.display_order : 0;
  const upd = c.updated_at ? `'${c.updated_at}'` : 'NOW()';

  sql += `INSERT INTO categories (slug, name, image, description, parent_slug, show_on_homepage, display_order, updated_at) VALUES ('${slug}', '${name}', '${img}', '${desc}', ${pSlug}, ${showH}, ${ord}, ${upd}) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image, description = EXCLUDED.description, parent_slug = EXCLUDED.parent_slug, show_on_homepage = EXCLUDED.show_on_homepage, display_order = EXCLUDED.display_order, updated_at = EXCLUDED.updated_at;\n`;
}

function escapeSql(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val).replace(/'/g, "''");
  return String(val).replace(/'/g, "''");
}

// 2. Products
sql += `\n-- 2. RESTORE PRODUCTS (${backup.products.length} rows)\n`;
for (const p of backup.products) {
  const id = escapeSql(p.id);
  const slug = escapeSql(p.slug);
  const title = escapeSql(p.title);
  const desc = escapeSql(p.description);
  const specs = escapeSql(p.specifications);
  const price = typeof p.price === 'number' ? p.price : 0;
  const compPrice = p.compare_at_price ? p.compare_at_price : 'NULL';
  const img = escapeSql(p.image);
  const cat = escapeSql(p.category);
  const catSlug = escapeSql(p.category_slug);
  const isNew = p.is_new_drop ? 'TRUE' : 'FALSE';
  const isLim = p.is_limited_edition ? 'TRUE' : 'FALSE';
  const isSplit = p.is_split_poster ? 'TRUE' : 'FALSE';
  const isBest = p.best_seller ? 'TRUE' : 'FALSE';
  const rating = typeof p.rating === 'number' ? p.rating : 5;
  const reviews = typeof p.review_count === 'number' ? p.review_count : 0;
  const sold = typeof p.sold_count === 'number' ? p.sold_count : 0;
  const inv = typeof p.inventory === 'number' ? p.inventory : 100;
  const variations = p.variations
    ? `'${JSON.stringify(p.variations).replace(/'/g, "''")}'::jsonb`
    : "'[]'::jsonb";
  const gallery =
    p.gallery_images && p.gallery_images.length > 0
      ? `ARRAY[${p.gallery_images.map((g) => `'${g.replace(/'/g, "''")}'`).join(',')}]::text[]`
      : 'ARRAY[]::text[]';
  const tags =
    p.tags && p.tags.length > 0
      ? `ARRAY[${p.tags.map((t) => `'${t.replace(/'/g, "''")}'`).join(',')}]::text[]`
      : 'ARRAY[]::text[]';
  const crt = p.created_at ? `'${p.created_at}'` : 'NOW()';
  const upd = p.updated_at ? `'${p.updated_at}'` : 'NOW()';

  sql += `INSERT INTO products (id, slug, title, description, specifications, price, compare_at_price, image, gallery_images, category, category_slug, tags, is_new_drop, is_limited_edition, is_split_poster, best_seller, rating, review_count, sold_count, inventory, variations, created_at, updated_at) VALUES ('${id}', '${slug}', '${title}', '${desc}', '${specs}', ${price}, ${compPrice}, '${img}', ${gallery}, '${cat}', '${catSlug}', ${tags}, ${isNew}, ${isLim}, ${isSplit}, ${isBest}, ${rating}, ${reviews}, ${sold}, ${inv}, ${variations}, ${crt}, ${upd}) ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description, specifications = EXCLUDED.specifications, price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price, image = EXCLUDED.image, gallery_images = EXCLUDED.gallery_images, category = EXCLUDED.category, category_slug = EXCLUDED.category_slug, tags = EXCLUDED.tags, is_new_drop = EXCLUDED.is_new_drop, is_limited_edition = EXCLUDED.is_limited_edition, is_split_poster = EXCLUDED.is_split_poster, best_seller = EXCLUDED.best_seller, rating = EXCLUDED.rating, review_count = EXCLUDED.review_count, sold_count = EXCLUDED.sold_count, inventory = EXCLUDED.inventory, variations = EXCLUDED.variations, updated_at = EXCLUDED.updated_at;\n`;
}

fs.writeFileSync('./supabase_backup_complete.sql', sql, 'utf8');
const sizeMb = (fs.statSync('./supabase_backup_complete.sql').size / 1024 / 1024).toFixed(2);
console.log(`SQL Backup saved to ./supabase_backup_complete.sql (${sizeMb} MB)`);
