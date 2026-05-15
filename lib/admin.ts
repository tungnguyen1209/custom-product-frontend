import { apiRequest } from './api';

export interface TaxonomyAdminEntry {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertTaxonomyPayload {
  name: string;
  slug?: string;
}

export type TaxonomyKind = 'tags' | 'collections';

/**
 * Admin-only helpers for `tags` and `collections`. All requests carry the
 * bearer token from localStorage via `apiRequest`; the backend's AdminGuard
 * rejects non-admin tokens with 403.
 */
export const taxonomyApi = {
  list(kind: TaxonomyKind): Promise<TaxonomyAdminEntry[]> {
    return apiRequest(`/admin/${kind}`);
  },

  create(
    kind: TaxonomyKind,
    payload: UpsertTaxonomyPayload,
  ): Promise<TaxonomyAdminEntry> {
    return apiRequest(`/admin/${kind}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(
    kind: TaxonomyKind,
    id: number,
    payload: UpsertTaxonomyPayload,
  ): Promise<TaxonomyAdminEntry> {
    return apiRequest(`/admin/${kind}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(kind: TaxonomyKind, id: number): Promise<void> {
    await apiRequest(`/admin/${kind}/${id}`, { method: 'DELETE' });
  },
};

export interface UploadedImage {
  url: string;
  key: string;
}

export function uploadAdminImage(
  dataUrl: string,
  subfolder?: string,
): Promise<UploadedImage> {
  return apiRequest('/admin/uploads/image', {
    method: 'POST',
    body: JSON.stringify({ dataUrl, subfolder }),
  });
}

/**
 * Read a `File` (from a file input) as a base64 data URL. Resolves with the
 * standard `data:<mime>;base64,<payload>` shape the backend's
 * `parseDataUrl` expects.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}
