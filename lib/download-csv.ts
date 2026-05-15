import { API_BASE_URL, getAuthToken } from './api';

/**
 * Fetch a CSV (or any binary) endpoint with the user's bearer token and
 * trigger a browser-native save dialog. Used by admin exports where the
 * standard `apiRequest` helper isn't a fit (it expects JSON).
 */
export async function downloadCsv(
  endpoint: string,
  filename: string,
): Promise<void> {
  const headers = new Headers();
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Export failed (HTTP ${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Schedule revocation after the browser has had a chance to start the
  // download. revokeObjectURL is synchronous but the in-flight download
  // request must already hold its own reference, so this is safe.
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
