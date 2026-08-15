-- Run once in Supabase SQL Editor. Adds drag-to-reorder support for
-- categories (nav bar + homepage order). Backfills existing rows with
-- their current alphabetical position so nothing jumps around visually
-- until you actually drag something in the admin panel.

alter table categories add column if not exists display_order integer;

with ordered as (
  select slug, row_number() over (order by name) as rn
  from categories
)
update categories c
set display_order = ordered.rn
from ordered
where c.slug = ordered.slug and c.display_order is null;
