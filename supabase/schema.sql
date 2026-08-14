-- LUMIFLICK Supabase schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
--
-- Security model: RLS is enabled on every table. Products/categories/
-- banners/reviews/settings get a public SELECT policy (this is a public
-- storefront's catalog data, meant to be visible). No INSERT/UPDATE/DELETE
-- policy exists for the anon/publishable key on any table — all writes go
-- through the app's server-side API routes using the service_role key,
-- which bypasses RLS entirely by design. Orders get zero public policies:
-- fully locked to service_role only, since they contain customer PII.

create table if not exists products (
  id text primary key,
  title text not null,
  slug text unique not null,
  category text not null,
  category_slug text not null,
  price numeric not null default 0,
  regular_price numeric,
  price_range text,
  image text,
  gallery_images jsonb default '[]',
  sale boolean default true,
  featured boolean default false,
  best_seller boolean default false,
  short_description text,
  description text,
  specifications jsonb,
  variations jsonb default '[]',
  rating numeric,
  review_count integer,
  tags jsonb default '[]',
  piece_selection_enabled boolean default false,
  max_pieces integer default 3,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists products_category_slug_idx on products (category_slug);
create index if not exists products_updated_at_idx on products (updated_at desc);
create index if not exists products_title_idx on products (title);

create table if not exists categories (
  slug text primary key,
  name text not null,
  image text,
  description text,
  parent_slug text,
  show_on_homepage boolean default false,
  updated_at timestamptz not null default now()
);

create table if not exists banners (
  id text primary key,
  image text not null,
  link text not null,
  title text,
  subtitle text,
  button_text text,
  badge text,
  display_order integer default 1,
  is_active boolean default true,
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id text primary key,
  author text,
  rating integer default 5,
  review_date text,
  verified boolean default true,
  comment text,
  product_name text,
  location text,
  screenshot_image text,
  featured boolean default true,
  updated_at timestamptz not null default now()
);

create table if not exists settings (
  id integer primary key default 1 check (id = 1), -- enforce a single row
  store_name text,
  phone text,
  email text,
  address text,
  inside_dhaka_delivery numeric,
  outside_dhaka_delivery numeric,
  promo_notice text,
  header_scripts text,
  body_scripts text,
  footer_scripts text,
  frame_effect_before_image text,
  frame_effect_after_image text,
  -- Top announcement ticker lines, e.g. [{"icon":"🎁","text":"Upto 35% Off"}].
  -- Admin-editable (add/remove/edit) at /jw8yenjnkanhr823/settings.
  promo_bar_items jsonb,
  updated_at timestamptz not null default now()
);
insert into settings (id, store_name, phone, email, address, inside_dhaka_delivery, outside_dhaka_delivery, promo_notice, promo_bar_items)
values (
  1, 'LUMIFLICK', '+8801400307299', 'info@lumiflick.shop', 'PTI Mor, Khulna, Bangladesh - 9100', 70, 130,
  '🎁 Upto 35% Off— Biggest Sale of the Year',
  '[{"icon":"🎁","text":"Upto 35% Off— Biggest Sale of the Year"},{"icon":"💳","text":"Cash on Delivery Available"},{"icon":"🚚","text":"Fast Delivery All Over Bangladesh"}]'::jsonb
)
on conflict (id) do nothing;

create table if not exists orders (
  order_id text primary key,
  customer_name text,
  phone text,
  email text,
  address text,
  city text,
  delivery_zone text,
  shipping_cost numeric,
  payment_method text,
  items jsonb,
  subtotal numeric,
  total numeric,
  order_date text,
  notes text,
  status text default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists raw_photos (
  id text primary key,
  image text not null,
  display_order integer default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists raw_photos_created_at_idx on raw_photos (created_at desc);

alter table products enable row level security;
alter table categories enable row level security;
alter table banners enable row level security;
alter table reviews enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table raw_photos enable row level security;

drop policy if exists "public read" on products;
create policy "public read" on products for select using (true);

drop policy if exists "public read" on categories;
create policy "public read" on categories for select using (true);

drop policy if exists "public read" on banners;
create policy "public read" on banners for select using (true);

drop policy if exists "public read" on reviews;
create policy "public read" on reviews for select using (true);

drop policy if exists "public read" on settings;
create policy "public read" on settings for select using (true);

drop policy if exists "public read" on raw_photos;
create policy "public read" on raw_photos for select using (true);

grant all on table public.raw_photos to anon, authenticated, service_role;

-- orders: intentionally no policies at all — service_role only.


