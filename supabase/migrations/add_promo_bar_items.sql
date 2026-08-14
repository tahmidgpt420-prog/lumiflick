-- Run this once in Supabase SQL Editor (Settings row already exists in
-- production, so schema.sql's seed insert won't touch it — this adds the
-- new column and backfills it for that existing row).

alter table settings add column if not exists promo_bar_items jsonb;

update settings
set promo_bar_items = '[
  {"icon":"🎁","text":"Upto 35% Off— Biggest Sale of the Year"},
  {"icon":"💳","text":"Cash on Delivery Available"},
  {"icon":"🚚","text":"Fast Delivery All Over Bangladesh"}
]'::jsonb
where id = 1 and promo_bar_items is null;
