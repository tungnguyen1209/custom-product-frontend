import { API_BASE_URL, apiRequest, setAuthToken } from './api';

export type AuthProvider = 'local' | 'google' | 'facebook';
export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  provider: AuthProvider;
  providerId: string | null;
  /** `'user'` (default) or `'admin'`. Admin-only routes gate on this. */
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Address {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  street: string;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAddressPayload {
  firstName: string;
  lastName: string;
  phone?: string;
  street: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  country: string;
  isDefault?: boolean;
}

export async function register(payload: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResponse> {
  const res: AuthResponse = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(res.accessToken);
  return res;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res: AuthResponse = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(res.accessToken);
  return res;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    /* token may already be invalid — ignore */
  }
  setAuthToken(null);
}

export function startOAuth(provider: 'google' | 'facebook'): void {
  if (typeof window === 'undefined') return;
  window.location.href = `${API_BASE_URL}/auth/${provider}`;
}

export function getMe(): Promise<AuthUser> {
  return apiRequest('/users/me');
}

export function updateProfile(payload: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}): Promise<AuthUser> {
  return apiRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiRequest('/users/me/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listAddresses(): Promise<Address[]> {
  return apiRequest('/users/me/addresses');
}

export function createAddress(payload: UpsertAddressPayload): Promise<Address> {
  return apiRequest('/users/me/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAddress(
  id: number,
  payload: UpsertAddressPayload,
): Promise<Address> {
  return apiRequest(`/users/me/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteAddress(id: number): Promise<void> {
  await apiRequest(`/users/me/addresses/${id}`, { method: 'DELETE' });
}

export function setDefaultAddress(id: number): Promise<Address> {
  return apiRequest(`/users/me/addresses/${id}/default`, { method: 'POST' });
}
