import { Product, Category, HeroBanner, CustomerReview, OrderDetails } from '@/types';
import { formatImageUrl } from '@/utils/driveUrl';

// --- Product ---
export function productToDb(p: Partial<Product>) {
  const row: Record<string, any> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.title !== undefined) row.title = p.title;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.category !== undefined) row.category = p.category;
  if (p.categorySlug !== undefined) row.category_slug = p.categorySlug;
  if (p.price !== undefined) row.price = p.price;
  if (p.regularPrice !== undefined) row.regular_price = p.regularPrice;
  if (p.priceRange !== undefined) row.price_range = p.priceRange;
  if (p.image !== undefined) row.image = p.image;
  if (p.galleryImages !== undefined) row.gallery_images = p.galleryImages;
  if (p.sale !== undefined) row.sale = p.sale;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.bestSeller !== undefined) row.best_seller = p.bestSeller;
  if (p.shortDescription !== undefined) row.short_description = p.shortDescription;
  if (p.description !== undefined) row.description = p.description;
  if (p.specifications !== undefined) row.specifications = p.specifications;
  if (p.variations !== undefined) row.variations = p.variations;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.reviewCount !== undefined) row.review_count = p.reviewCount;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.pieceSelectionEnabled !== undefined) row.piece_selection_enabled = p.pieceSelectionEnabled;
  if (p.maxPieces !== undefined) row.max_pieces = p.maxPieces;
  if (p.showSizeChart !== undefined) {
    row.show_size_chart = p.showSizeChart;
  }
  row.updated_at = new Date().toISOString();
  return row;
}

export function productFromDb(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    categorySlug: row.category_slug,
    price: Number(row.price),
    regularPrice: row.regular_price !== null ? Number(row.regular_price) : undefined,
    priceRange: row.price_range ?? undefined,
    image: row.image ?? '',
    galleryImages: row.gallery_images ?? undefined,
    sale: row.sale ?? undefined,
    featured: row.featured ?? undefined,
    bestSeller: row.best_seller ?? undefined,
    shortDescription: row.short_description ?? undefined,
    description: row.description ?? undefined,
    specifications: row.specifications ?? undefined,
    variations: row.variations ?? undefined,
    rating: row.rating !== null ? Number(row.rating) : undefined,
    reviewCount: row.review_count ?? undefined,
    tags: row.tags ?? undefined,
    pieceSelectionEnabled: row.piece_selection_enabled ?? undefined,
    maxPieces: row.max_pieces ?? undefined,
    showSizeChart: row.show_size_chart !== undefined && row.show_size_chart !== null
      ? Boolean(row.show_size_chart)
      : (row.specifications?.showSizeChart ?? true),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
  };
}

// --- Category ---
export function categoryToDb(c: Partial<Category>) {
  const row: Record<string, any> = {};
  if (c.slug !== undefined) row.slug = c.slug;
  if (c.name !== undefined) row.name = c.name;
  if (c.image !== undefined) row.image = c.image;
  if (c.description !== undefined) row.description = c.description;
  const parentValue = c.parentSlug || c.parentId || null;
  if (c.parentSlug !== undefined || c.parentId !== undefined) {
    row.parent_slug = parentValue;
  }
  if (c.showOnHomepage !== undefined) row.show_on_homepage = c.showOnHomepage;
  if (c.order !== undefined) row.display_order = c.order;
  row.updated_at = new Date().toISOString();
  return row;
}

export function categoryFromDb(row: any): Category {
  const rawSlug = row.slug || '';
  const cleanId = row.id || `cat_${rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') || 'gen'}`;
  const parent = row.parent_slug || row.parent_id || null;

  return {
    id: cleanId,
    slug: row.slug,
    name: row.name,
    image: row.image ?? '/logo.png',
    description: row.description ?? undefined,
    parentSlug: parent,
    parentId: row.parent_id || parent,
    showOnHomepage: row.show_on_homepage ?? false,
    order: row.display_order ?? 0,
  };
}

// --- Banner ---
export function bannerToDb(b: Partial<HeroBanner>) {
  const row: Record<string, any> = {};
  if (b.id !== undefined) row.id = b.id;
  if (b.image !== undefined) row.image = b.image;
  if (b.link !== undefined) row.link = b.link;
  if (b.title !== undefined) row.title = b.title;
  if (b.subtitle !== undefined) row.subtitle = b.subtitle;
  if (b.buttonText !== undefined) row.button_text = b.buttonText;
  if (b.badge !== undefined) row.badge = b.badge;
  if (b.order !== undefined) row.display_order = b.order;
  if (b.isActive !== undefined) row.is_active = b.isActive;
  row.updated_at = new Date().toISOString();
  return row;
}

export function bannerFromDb(row: any): HeroBanner {
  return {
    id: row.id,
    image: formatImageUrl(row.image, 'original'),
    link: row.link,
    title: row.title ?? undefined,
    subtitle: row.subtitle ?? undefined,
    buttonText: row.button_text ?? undefined,
    badge: row.badge ?? undefined,
    order: row.display_order ?? 1,
    isActive: row.is_active ?? true,
  };
}

// --- Review ---
export function reviewToDb(r: Partial<CustomerReview>) {
  const row: Record<string, any> = {};
  if (r.id !== undefined) row.id = r.id;
  if (r.author !== undefined) row.author = r.author;
  if (r.rating !== undefined) row.rating = r.rating;
  if (r.date !== undefined) row.review_date = r.date;
  if (r.verified !== undefined) row.verified = r.verified;
  if (r.comment !== undefined) row.comment = r.comment;
  if (r.productName !== undefined) row.product_name = r.productName;
  if (r.location !== undefined) row.location = r.location;
  if (r.screenshotImage !== undefined) row.screenshot_image = r.screenshotImage;
  if (r.featured !== undefined) row.featured = r.featured;
  row.updated_at = new Date().toISOString();
  return row;
}

export function reviewFromDb(row: any): CustomerReview {
  return {
    id: row.id,
    author: row.author ?? 'LUMIFLICK Customer',
    rating: row.rating ?? 5,
    date: row.review_date ?? '',
    verified: row.verified ?? true,
    comment: row.comment ?? '',
    productName: row.product_name ?? undefined,
    location: row.location ?? undefined,
    screenshotImage: row.screenshot_image ?? undefined,
    featured: row.featured ?? true,
  };
}

// --- Order ---
export function orderToDb(o: Partial<OrderDetails> & { status?: string }) {
  const row: Record<string, any> = {};
  if (o.orderId !== undefined) row.order_id = o.orderId;
  if (o.customerName !== undefined) row.customer_name = o.customerName;
  if (o.phone !== undefined) row.phone = o.phone;
  if (o.email !== undefined) row.email = o.email;
  if (o.address !== undefined) row.address = o.address;
  if (o.city !== undefined) row.city = o.city;
  if (o.deliveryZone !== undefined) row.delivery_zone = o.deliveryZone;
  if (o.shippingCost !== undefined) row.shipping_cost = o.shippingCost;
  if (o.paymentMethod !== undefined) row.payment_method = o.paymentMethod;
  if (o.items !== undefined) row.items = o.items;
  if (o.subtotal !== undefined) row.subtotal = o.subtotal;
  if (o.total !== undefined) row.total = o.total;
  if (o.orderDate !== undefined) row.order_date = o.orderDate;
  if (o.notes !== undefined) row.notes = o.notes;
  if (o.status !== undefined) row.status = o.status;
  return row;
}

export function orderFromDb(row: any): OrderDetails & { status?: string } {
  return {
    orderId: row.order_id,
    customerName: row.customer_name ?? '',
    phone: row.phone ?? '',
    email: row.email ?? undefined,
    address: row.address ?? '',
    city: row.city ?? '',
    deliveryZone: row.delivery_zone,
    shippingCost: Number(row.shipping_cost ?? 0),
    paymentMethod: row.payment_method,
    items: row.items ?? [],
    subtotal: Number(row.subtotal ?? 0),
    total: Number(row.total ?? 0),
    orderDate: row.order_date ?? '',
    notes: row.notes ?? undefined,
    status: row.status ?? 'pending',
  };
}

const DEFAULT_PROMO_BAR_ITEMS = [
  { icon: '🎁', text: 'Upto 35% Off— Biggest Sale of the Year' },
  { icon: '💳', text: 'Cash on Delivery Available' },
  { icon: '🚚', text: 'Fast Delivery All Over Bangladesh' },
];

// --- Settings ---
export function settingsFromDb(row: any) {
  return {
    storeName: row.store_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    insideDhakaDelivery: Number(row.inside_dhaka_delivery ?? 0),
    outsideDhakaDelivery: Number(row.outside_dhaka_delivery ?? 0),
    promoNotice: row.promo_notice,
    headerScripts: row.header_scripts ?? '',
    bodyScripts: row.body_scripts ?? '',
    footerScripts: row.footer_scripts ?? '',
    frameEffectBeforeImage: row.frame_effect_before_image ?? '',
    frameEffectAfterImage: row.frame_effect_after_image ?? '',
    // Falls back to the old hardcoded 3 lines if the column is missing
    // (migration not yet run) or genuinely unset.
    promoBarItems: Array.isArray(row.promo_bar_items) ? row.promo_bar_items : DEFAULT_PROMO_BAR_ITEMS,
  };
}

export function settingsToDb(s: Record<string, any>) {
  const row: Record<string, any> = {};
  if (s.storeName !== undefined) row.store_name = s.storeName;
  if (s.phone !== undefined) row.phone = s.phone;
  if (s.email !== undefined) row.email = s.email;
  if (s.address !== undefined) row.address = s.address;
  if (s.insideDhakaDelivery !== undefined) row.inside_dhaka_delivery = s.insideDhakaDelivery;
  if (s.outsideDhakaDelivery !== undefined) row.outside_dhaka_delivery = s.outsideDhakaDelivery;
  if (s.promoNotice !== undefined) row.promo_notice = s.promoNotice;
  if (s.headerScripts !== undefined) row.header_scripts = s.headerScripts;
  if (s.bodyScripts !== undefined) row.body_scripts = s.bodyScripts;
  if (s.footerScripts !== undefined) row.footer_scripts = s.footerScripts;
  if (s.frameEffectBeforeImage !== undefined) row.frame_effect_before_image = s.frameEffectBeforeImage;
  if (s.frameEffectAfterImage !== undefined) row.frame_effect_after_image = s.frameEffectAfterImage;
  if (s.promoBarItems !== undefined) row.promo_bar_items = s.promoBarItems;
  row.updated_at = new Date().toISOString();
}


