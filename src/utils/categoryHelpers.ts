import { Category, Product } from '@/types';

/**
 * Normalizes a string (slug or name) for comparison (lowercase, trimmed, hyphens).
 */
export function normalizeCategorySlug(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Returns main/top-level categories (those without a parent).
 * Excludes virtual categories like 'best-selling'.
 */
export function getMainCategories(categories: Category[]): Category[] {
  return categories.filter(
    (c) =>
      !c.parentSlug &&
      !c.parentId &&
      c.slug !== 'best-selling' &&
      c.name.toLowerCase() !== 'best selling'
  );
}

/**
 * Returns direct sub-categories for a given parent ID, slug or name.
 */
export function getSubcategories(
  parentIdOrSlugOrName: string,
  categories: Category[]
): Category[] {
  const norm = normalizeCategorySlug(parentIdOrSlugOrName);
  if (!norm) return [];

  const rawLower = parentIdOrSlugOrName.toLowerCase().trim();

  return categories.filter((c) => {
    const pSlugNorm = normalizeCategorySlug(c.parentSlug);
    const pIdNorm = normalizeCategorySlug(c.parentId);
    const pSlugRaw = (c.parentSlug || '').toLowerCase().trim();
    const pIdRaw = (c.parentId || '').toLowerCase().trim();

    return (
      pSlugNorm === norm ||
      pIdNorm === norm ||
      pSlugRaw === rawLower ||
      pIdRaw === rawLower
    );
  });
}

/**
 * Finds a category object by its ID, slug or name.
 */
export function findCategoryBySlugOrName(
  idOrSlugOrName: string,
  categories: Category[]
): Category | undefined {
  if (!idOrSlugOrName) return undefined;
  const norm = normalizeCategorySlug(idOrSlugOrName);
  const rawLower = idOrSlugOrName.toLowerCase().trim();

  return categories.find((c) => {
    const cId = c.id?.toLowerCase().trim();
    const cIdNorm = normalizeCategorySlug(c.id);
    const cSlug = normalizeCategorySlug(c.slug);
    const cName = normalizeCategorySlug(c.name);
    const cRawSlug = c.slug.toLowerCase().trim();
    const cRawName = c.name.toLowerCase().trim();

    return (
      (cId && cId === rawLower) ||
      (cIdNorm && cIdNorm === norm) ||
      cSlug === norm ||
      cName === norm ||
      cRawSlug === rawLower ||
      cRawName === rawLower
    );
  });
}

/**
 * Finds the parent category of a given category, if it has one.
 */
export function getParentCategory(
  category: Category,
  categories: Category[]
): Category | null {
  const parentKey = category.parentId || category.parentSlug;
  if (!parentKey) return null;

  return findCategoryBySlugOrName(parentKey, categories) || null;
}

/**
 * Traverses the category tree and returns a Set of all normalized slugs
 * and raw strings for the given category AND all its descendants.
 */
export function getCategoryTreeSlugs(
  targetSlugOrName: string,
  categories: Category[]
): Set<string> {
  const matchedSlugs = new Set<string>();
  const rawTarget = targetSlugOrName.toLowerCase().trim();
  const normTarget = normalizeCategorySlug(targetSlugOrName);

  if (rawTarget) matchedSlugs.add(rawTarget);
  if (normTarget) matchedSlugs.add(normTarget);

  if (rawTarget === 'all' || !rawTarget) {
    return matchedSlugs;
  }

  // Find root category/categories matching target
  const targetCats = categories.filter((c) => {
    const cIdNorm = normalizeCategorySlug(c.id);
    const cSlug = normalizeCategorySlug(c.slug);
    const cName = normalizeCategorySlug(c.name);
    const cRawId = c.id?.toLowerCase().trim();
    const cRawSlug = c.slug.toLowerCase().trim();
    const cRawName = c.name.toLowerCase().trim();

    return (
      cIdNorm === normTarget ||
      cSlug === normTarget ||
      cName === normTarget ||
      cRawId === rawTarget ||
      cRawSlug === rawTarget ||
      cRawName === rawTarget
    );
  });

  const queue = [...targetCats];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const curIdNorm = normalizeCategorySlug(current.id);
    const curSlugNorm = normalizeCategorySlug(current.slug);
    const curNameNorm = normalizeCategorySlug(current.name);
    const curIdRaw = current.id?.toLowerCase().trim();
    const curSlugRaw = current.slug?.toLowerCase().trim();
    const curNameRaw = current.name?.toLowerCase().trim();

    if (curIdNorm) matchedSlugs.add(curIdNorm);
    if (curSlugNorm) matchedSlugs.add(curSlugNorm);
    if (curNameNorm) matchedSlugs.add(curNameNorm);
    if (curIdRaw) matchedSlugs.add(curIdRaw);
    if (curSlugRaw) matchedSlugs.add(curSlugRaw);
    if (curNameRaw) matchedSlugs.add(curNameRaw);

    const visitKey = current.id || curSlugNorm || curNameNorm;
    if (visited.has(visitKey)) continue;
    visited.add(visitKey);

    // Find direct children of current
    const children = categories.filter((c) => {
      const pSlugNorm = normalizeCategorySlug(c.parentSlug);
      const pIdNorm = normalizeCategorySlug(c.parentId);
      const pSlugRaw = (c.parentSlug || '').toLowerCase().trim();
      const pIdRaw = (c.parentId || '').toLowerCase().trim();

      return (
        pSlugNorm === curSlugNorm ||
        pSlugNorm === curNameNorm ||
        pIdNorm === curIdNorm ||
        pIdNorm === curSlugNorm ||
        pSlugRaw === curSlugRaw ||
        pSlugRaw === curNameRaw ||
        pIdRaw === curIdRaw ||
        pIdRaw === curSlugRaw
      );
    });

    for (const child of children) {
      queue.push(child);
    }
  }

  return matchedSlugs;
}

/**
 * Server-side counterpart to matchesCategory/getCategoryTreeSlugs — used by
 * /api/products to build a Postgres .in() filter instead of pulling every
 * row down and filtering client-side. Returns clean, exact-as-stored slug
 * and name lists (not the mixed-normalization Set the client-side tree walk
 * produces), since a DB .in() needs to match column values verbatim.
 */
export function resolveCategoryFilterValues(
  targetSlugOrName: string,
  categories: Category[]
): { slugs: string[]; names: string[] } {
  const target = findCategoryBySlugOrName(targetSlugOrName, categories);
  
  // Safe fallback if category not in categories table
  if (!target) {
    const raw = targetSlugOrName.trim();
    const norm = normalizeCategorySlug(targetSlugOrName);
    return {
      slugs: Array.from(new Set([raw, norm].filter(Boolean))),
      names: [raw],
    };
  }

  const collected: Category[] = [];
  const queue = [target];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = current.id || normalizeCategorySlug(current.slug) || normalizeCategorySlug(current.name);
    if (visited.has(key)) continue;
    visited.add(key);
    collected.push(current);

    const children = categories.filter((c) => {
      const pSlugNorm = normalizeCategorySlug(c.parentSlug);
      const pIdNorm = normalizeCategorySlug(c.parentId);
      const cIdNorm = normalizeCategorySlug(current.id);
      const cSlugNorm = normalizeCategorySlug(current.slug);
      const cNameNorm = normalizeCategorySlug(current.name);

      return (
        pSlugNorm === cSlugNorm ||
        pSlugNorm === cNameNorm ||
        pIdNorm === cIdNorm ||
        pIdNorm === cSlugNorm
      );
    });
    queue.push(...children);
  }

  const slugs = new Set<string>();
  const names = new Set<string>();

  for (const c of collected) {
    if (c.slug) {
      slugs.add(c.slug);
      const normSlug = normalizeCategorySlug(c.slug);
      if (normSlug) slugs.add(normSlug);
    }
    if (c.id) {
      slugs.add(c.id);
    }
    if (c.name) {
      names.add(c.name);
      // If name is e.g. "DragonBall glass poster", also add clean "DragonBall"
      const cleanName = c.name.replace(/\s+glass\s+poster/i, '').trim();
      if (cleanName && cleanName !== c.name) names.add(cleanName);
    }
  }

  return {
    slugs: Array.from(slugs).filter(Boolean),
    names: Array.from(names).filter(Boolean),
  };
}

/**
 * Checks if a product matches a target category (handling parent/child category hierarchy and best sellers).
 */
export function matchesCategory(
  product: Product,
  targetCategorySlug: string,
  categories: Category[]
): boolean {
  const normTarget = targetCategorySlug.toLowerCase().trim();
  if (normTarget === 'all' || !normTarget) return true;

  if (normTarget === 'best-selling') {
    return Boolean(
      product.bestSeller ||
      product.categorySlug === 'best-selling' ||
      product.category?.toLowerCase() === 'best selling'
    );
  }

  const allowedTreeSlugs = getCategoryTreeSlugs(targetCategorySlug, categories);

  const pCatSlugNorm = normalizeCategorySlug(product.categorySlug);
  const pCatNameNorm = normalizeCategorySlug(product.category);
  const pCatSlugRaw = product.categorySlug?.toLowerCase().trim();
  const pCatNameRaw = product.category?.toLowerCase().trim();

  return Boolean(
    (pCatSlugNorm && allowedTreeSlugs.has(pCatSlugNorm)) ||
    (pCatNameNorm && allowedTreeSlugs.has(pCatNameNorm)) ||
    (pCatSlugRaw && allowedTreeSlugs.has(pCatSlugRaw)) ||
    (pCatNameRaw && allowedTreeSlugs.has(pCatNameRaw))
  );
}
