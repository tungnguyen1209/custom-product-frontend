export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const CUSTOMIZATION_BASE_URL = `${API_BASE_URL}/product/customization`;

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
}

export function getProduct(id: string | number): Promise<ProductBasicInfo> {
  return apiRequest(`/products/${id}`);
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
