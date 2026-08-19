-- LUMIFLICK Categories Migration: Add id and parent_id columns
-- Run once in Supabase Dashboard -> SQL Editor -> New Query -> Run.

alter table categories add column if not exists id text;
alter table categories add column if not exists parent_id text;

-- Backfill id with clean category IDs (e.g. cat_anime, cat_car, etc.)
update categories
set id = 'cat_' || lower(regexp_replace(trim(slug), '[^a-zA-Z0-9]+', '_', 'g'))
where id is null or id = '';

-- Backfill parent_id matching parent's id or parent_slug
update categories c
set parent_id = 'cat_' || lower(regexp_replace(trim(c.parent_slug), '[^a-zA-Z0-9]+', '_', 'g'))
where c.parent_slug is not null and c.parent_slug <> '' and (c.parent_id is null or c.parent_id = '');

-- Add index on id for fast lookups
create unique index if not exists categories_id_idx on categories (id);
