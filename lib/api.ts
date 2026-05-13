export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const CUSTOMIZATION_BASE_URL = `${API_BASE_URL}/product/customization`;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code = entity[1] === 'x' || entity[1] === 'X'
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    const named = NAMED_ENTITIES[entity.toLowerCase()];
    return named ?? match;
  });
}

export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  sessionId?: string,
) {
  const headers = new Headers(options.headers);
  if (sessionId) {
    headers.set('x-session-id', sessionId);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }

  if (response.status === 204) return null;
  return response.json();
}

export interface ProductBasicInfo {
  id: number;
  externalId: string;
  name: string;
  description: string | null;
  basePrice: number | string;
  comparePrice: number | string | null;
  gallery: string[] | null;
  slug: string | null;
  shop: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationTemplate {
  id: string;
  width: number;
  height: number;
  baseFile: string;
  groups: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elementsImageLibraries: any;
  elementsUsingLibrary: Array<string | number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  librarySegmentMap: any;
}

export interface VariantPriceEntry {
  variantId: string;
  price: number | null;
  comparePrice: number | null;
  publicTitle: string | null;
  title: string | null;
  available: boolean;
}

export interface ProductCustomizationData {
  initialTemplateId?: string;
  optionSetUuid?: string;
  optionSetName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any[];
  templateIds: string[];
  /** Initial template inline (saves a round-trip when initializing WM). */
  template?: CustomizationTemplate;
  /** Per-variant prices keyed by Shopify variant ID — used for live price switching. */
  variants?: VariantPriceEntry[];
  /** Option IDs (in order: option1, option2, option3) whose values form the
   *  variant combination. Frontend reads these to know which dropdowns are
   *  variation selectors. */
  variationOptionIds?: number[];
}

export interface ProductListItem {
  id: number;
  externalId: string;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  price: number;
  displayPrice: string;
  url: string;
}

export interface PaginatedProducts {
  items: ProductListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface TaxonomyTerm {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

export type ProductSort = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export interface ProductListFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  collections?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
}

export async function getProducts(
  filters: ProductListFilters = {},
): Promise<PaginatedProducts> {
  const qs = new URLSearchParams();
  qs.set('page', String(filters.page ?? 1));
  qs.set('limit', String(filters.limit ?? 24));
  if (filters.search?.trim()) qs.set('search', filters.search.trim());
  if (filters.tags?.length) qs.set('tags', filters.tags.join(','));
  if (filters.collections?.length)
    qs.set('collections', filters.collections.join(','));
  if (filters.minPrice != null) qs.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) qs.set('maxPrice', String(filters.maxPrice));
  if (filters.sort) qs.set('sort', filters.sort);

  const data: PaginatedProducts = await apiRequest(`/products?${qs.toString()}`);
  return {
    ...data,
    items: data.items.map((p) => ({
      ...p,
      name: p.name ? decodeHtmlEntities(p.name) : p.name,
    })),
  };
}

export async function getProductsByCollection(
  slug: string,
  page = 1,
  limit = 24,
): Promise<PaginatedProducts> {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const data: PaginatedProducts = await apiRequest(
    `/products/collections/${encodeURIComponent(slug)}?${qs.toString()}`,
  );
  return {
    ...data,
    items: data.items.map((p) => ({
      ...p,
      name: p.name ? decodeHtmlEntities(p.name) : p.name,
    })),
  };
}

export async function getProductsByTag(
  slug: string,
  page = 1,
  limit = 24,
): Promise<PaginatedProducts> {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const data: PaginatedProducts = await apiRequest(
    `/products/tags/${encodeURIComponent(slug)}?${qs.toString()}`,
  );
  return {
    ...data,
    items: data.items.map((p) => ({
      ...p,
      name: p.name ? decodeHtmlEntities(p.name) : p.name,
    })),
  };
}

export async function getCollections(): Promise<TaxonomyTerm[]> {
  return apiRequest('/products/collections');
}

export async function getTags(): Promise<TaxonomyTerm[]> {
  return apiRequest('/products/tags');
}

export async function getProduct(
  id: string | number,
  init?: RequestInit,
): Promise<ProductBasicInfo> {
  const product: ProductBasicInfo = await apiRequest(`/products/${id}`, init);
  return {
    ...product,
    name: product.name ? decodeHtmlEntities(product.name) : product.name,
    description: product.description ? decodeHtmlEntities(product.description) : product.description,
  };
}

/**
 * Fetch options + initial template inline.
 * Backed by `GET /product/customization/:productId` which returns `{ result }`.
 */
export async function getProductCustomization(
  id: string | number,
): Promise<ProductCustomizationData> {
  const json = await apiRequest(`/product/customization/${id}`);
  return json?.result ?? json;
}
