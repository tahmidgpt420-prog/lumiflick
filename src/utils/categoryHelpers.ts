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
 * Returns direct sub-categories for a given parent slug or name.
 */
export function getSubcategories(
  parentSlugOrName: string,
  categories: Category[]
): Category[] {
  const norm = normalizeCategorySlug(parentSlugOrName);
  if (!norm) return [];

  return categories.filter((c) => {
    const pSlug = normalizeCategorySlug(c.parentSlug || c.parentId);
    return pSlug === norm;
  });
}

/**
 * Finds a category object by its slug or name.
 */
export function findCategoryBySlugOrName(
  slugOrName: string,
  categories: Category[]
): Category | undefined {
  const norm = normalizeCategorySlug(slugOrName);
  const rawLower = slugOrName.toLowerCase().trim();

  return categories.find((c) => {
    const cSlug = normalizeCategorySlug(c.slug);
    const cName = normalizeCategorySlug(c.name);
    return (
      cSlug === norm ||
      cName === norm ||
      c.slug.toLowerCase().trim() === rawLower ||
      c.name.toLowerCase().trim() === rawLower
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
  const parentKey = category.parentSlug || category.parentId;
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
    const cSlug = normalizeCategorySlug(c.slug);
    const cName = normalizeCategorySlug(c.name);
    const cRawSlug = c.slug.toLowerCase().trim();
    const cRawName = c.name.toLowerCase().trim();

    return (
      cSlug === normTarget ||
      cName === normTarget ||
      cRawSlug === rawTarget ||
      cRawName === rawTarget
    );
  });

  const queue = [...targetCats];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const curSlugNorm = normalizeCategorySlug(current.slug);
    const curNameNorm = normalizeCategorySlug(current.name);
    const curSlugRaw = current.slug?.toLowerCase().trim();
    const curNameRaw = current.name?.toLowerCase().trim();

    if (curSlugNorm) matchedSlugs.add(curSlugNorm);
    if (curNameNorm) matchedSlugs.add(curNameNorm);
    if (curSlugRaw) matchedSlugs.add(curSlugRaw);
    if (curNameRaw) matchedSlugs.add(curNameRaw);

    const visitKey = curSlugNorm || curNameNorm;
    if (visited.has(visitKey)) continue;
    visited.add(visitKey);

    // Find direct children of current
    const children = categories.filter((c) => {
      const pSlugNorm = normalizeCategorySlug(c.parentSlug || c.parentId);
      const pRaw = (c.parentSlug || c.parentId || '').toLowerCase().trim();

      return (
        pSlugNorm === curSlugNorm ||
        pSlugNorm === curNameNorm ||
        pRaw === curSlugRaw ||
        pRaw === curNameRaw
      );
    });

    for (const child of children) {
      queue.push(child);
    }
  }

  return matchedSlugs;
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
