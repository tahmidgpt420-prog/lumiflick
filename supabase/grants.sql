-- Explicit grants — needed because "automatically expose new tables" was
-- (correctly) left unchecked, which also blocked service_role's default
-- access, not just anon's. RLS policies still govern what anon can
-- actually see/do; these grants just make the tables reachable at all.

grant usage on schema public to service_role, anon;

grant select, insert, update, delete on products, categories, banners, reviews, settings, orders
  to service_role;

grant select on products, categories, banners, reviews, settings to anon;
