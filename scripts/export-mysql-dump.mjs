// Converts supabase_backup_complete.json into a MySQL/MariaDB dump on stdout.
// Mirrors supabase/schema.sql. Re-running drops and recreates every table.
// Text columns are LONGTEXT: images are stored inline as base64 data URLs,
// and TEXT (64KB) silently truncated them.
//
//   node scripts/export-mysql-dump.mjs | ssh hostinger mysql
import fs from 'fs';

const backup = JSON.parse(fs.readFileSync('./supabase_backup_complete.json', 'utf8'));

const SCHEMA = `
SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET SESSION sql_mode = CONCAT(@@sql_mode, ',STRICT_ALL_TABLES');

DROP TABLE IF EXISTS products, categories, banners, reviews, settings, orders, raw_photos;

CREATE TABLE products (
  id VARCHAR(191) PRIMARY KEY,
  title LONGTEXT NOT NULL,
  slug VARCHAR(191) NOT NULL UNIQUE,
  category VARCHAR(191) NOT NULL,
  category_slug VARCHAR(191) NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  regular_price DECIMAL(12,2),
  price_range LONGTEXT,
  image LONGTEXT,
  gallery_images JSON,
  sale BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  best_seller BOOLEAN DEFAULT FALSE,
  short_description LONGTEXT,
  description LONGTEXT,
  specifications JSON,
  variations JSON,
  rating DECIMAL(3,2),
  review_count INT,
  tags JSON,
  piece_selection_enabled BOOLEAN DEFAULT FALSE,
  max_pieces INT DEFAULT 3,
  show_size_chart BOOLEAN DEFAULT TRUE,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX products_category_slug_idx (category_slug),
  INDEX products_updated_at_idx (updated_at)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  slug VARCHAR(191) PRIMARY KEY,
  id VARCHAR(191) UNIQUE,
  name LONGTEXT NOT NULL,
  image LONGTEXT,
  description LONGTEXT,
  parent_slug VARCHAR(191),
  parent_id VARCHAR(191),
  show_on_homepage BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE banners (
  id VARCHAR(191) PRIMARY KEY,
  image LONGTEXT NOT NULL,
  link LONGTEXT NOT NULL,
  title LONGTEXT,
  subtitle LONGTEXT,
  button_text LONGTEXT,
  badge LONGTEXT,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
  id VARCHAR(191) PRIMARY KEY,
  author LONGTEXT,
  rating INT DEFAULT 5,
  review_date LONGTEXT,
  verified BOOLEAN DEFAULT TRUE,
  comment LONGTEXT,
  product_name LONGTEXT,
  location LONGTEXT,
  screenshot_image LONGTEXT,
  featured BOOLEAN DEFAULT TRUE,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name LONGTEXT,
  phone LONGTEXT,
  email LONGTEXT,
  address LONGTEXT,
  inside_dhaka_delivery DECIMAL(12,2),
  outside_dhaka_delivery DECIMAL(12,2),
  promo_notice LONGTEXT,
  header_scripts LONGTEXT,
  body_scripts LONGTEXT,
  footer_scripts LONGTEXT,
  frame_effect_before_image LONGTEXT,
  frame_effect_after_image LONGTEXT,
  promo_bar_items JSON,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  order_id VARCHAR(191) PRIMARY KEY,
  customer_name LONGTEXT,
  phone LONGTEXT,
  email LONGTEXT,
  address LONGTEXT,
  city LONGTEXT,
  delivery_zone LONGTEXT,
  shipping_cost DECIMAL(12,2),
  payment_method LONGTEXT,
  items JSON,
  subtotal DECIMAL(12,2),
  total DECIMAL(12,2),
  order_date LONGTEXT,
  notes LONGTEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE raw_photos (
  id VARCHAR(191) PRIMARY KEY,
  image LONGTEXT NOT NULL,
  display_order INT DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX raw_photos_created_at_idx (created_at)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const TIMESTAMP_COLS = new Set(['updated_at', 'created_at']);

function str(s) {
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\0/g, '\\0') + "'";
}

function value(col, v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') return str(JSON.stringify(v));
  // Postgres timestamptz ("2026-08-17T11:40:23.223+00:00") -> UTC DATETIME
  if (TIMESTAMP_COLS.has(col)) return str(new Date(v).toISOString().replace('T', ' ').replace('Z', ''));
  return str(v);
}

const out = [SCHEMA];
for (const table of ['categories', 'products', 'banners', 'reviews', 'settings', 'orders', 'raw_photos']) {
  const rows = backup[table] || [];
  // One multi-row INSERT per 100 rows keeps statements well under max_allowed_packet
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const cols = [...new Set(chunk.flatMap(Object.keys))];
    const values = chunk.map((r) => '(' + cols.map((c) => value(c, r[c])).join(', ') + ')');
    out.push(`INSERT INTO ${table} (${cols.join(', ')}) VALUES\n${values.join(',\n')};`);
  }
}

process.stdout.write(out.join('\n\n') + '\n');
