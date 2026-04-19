import { mergeRequestHeaders } from './requestHeaders.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export const AUTH_TOKEN_STORAGE_KEY = 'pjw_auth_token';
export const AUTH_USER_STORAGE_KEY = 'pjw_auth_user';
export const AUTH_CHANGED_EVENT = 'pjw-auth-changed';

export interface StoredAuthUser {
  id: string;
  email: string;
  role: string;
}

function dispatchAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

function safeParseStoredAuthUser(value: string | null): StoredAuthUser | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredAuthUser>;
    if (!parsed || typeof parsed !== 'object') return null;

    const id = String(parsed.id ?? '').trim();
    const email = String(parsed.email ?? '').trim();
    const role = String(parsed.role ?? '').trim();

    if (!id || !email || !role) return null;
    return { id, email, role };
  } catch {
    return null;
  }
}

function clearLegacyLocalAuthStorage() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch {
    // Ignore localStorage cleanup issues and keep sessionStorage as source of truth.
  }
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    clearLegacyLocalAuthStorage();
    const token = window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return token && token.trim() ? token : null;
  } catch {
    return null;
  }
}

export function getStoredAuthUser(): StoredAuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    clearLegacyLocalAuthStorage();
    const raw = window.sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
    return safeParseStoredAuthUser(raw);
  } catch {
    return null;
  }
}

export function setStoredAuthSession(token: string, user: StoredAuthUser): void {
  if (typeof window === 'undefined') return;

  const normalizedToken = String(token ?? '').trim();
  if (!normalizedToken) {
    clearStoredAuthSession();
    return;
  }

  window.sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalizedToken);
  window.sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  clearLegacyLocalAuthStorage();
  dispatchAuthChanged();
}

export function clearStoredAuthSession(): void {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch {
    // Ignore session storage cleanup issues.
  }

  clearLegacyLocalAuthStorage();
  dispatchAuthChanged();
}

function buildAuthHeaders(authToken?: string): HeadersInit {
  const token = authToken ?? getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = mergeRequestHeaders(options.headers);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearStoredAuthSession();
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Request failed' }));
    const fallbackMessage =
      response.status === 401
        ? 'Your session is invalid or has expired. Please log in again.'
        : `Request failed with status ${response.status}`;
    const message = payload?.message ?? payload?.error ?? fallbackMessage;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export interface HomeStats {
  money_raised: number;
  meals_donated: number;
  active_volunteers: number;
  delivery_count: number;
  sponsor_count: number;
  fundraising_goal: number;
}

export interface SponsorCard {
  id: string;
  company_name: string;
  logo_url: string;
  website_url: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'community';
  contribution_amount: number;
  description: string;
  active: boolean;
}

interface SponsorApiRecord {
  sponsor_id: string;
  sponsor_name: string;
  sponsor_description: string;
  sponsor_picture: string | null;
  amount: number | null;
}

export interface ShopItemCard {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  sizes_available: string[];
  in_stock: boolean;
  stock_quantity: number;
}

interface StoreItemApiRecord {
  item_id: string;
  name: string;
  description: string;
  stock: string | number;
  price: number | null;
  img: string | null;
}

export interface AdvocacyUpdate {
  id: string;
  created_at: string | null;
  title: string;
  bill_number: string | null;
  content: string;
  status: string | null;
  impact: string | null;
  priority: string | null;
  action_taken: string | null;
  link_url: string | null;
}

export interface DeliveryLog {
  id: string;
  created_at: string | null;
  user_id: string | null;
  volunteer_email: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  items: string[];
}

export interface DeliveryCreatePayload {
  lat: number;
  lng: number;
  notes?: string;
  items?: string[];
}

export interface VolunteerSummary {
  active_volunteers: number;
  total_hours_logged: number;
  entry_count: number;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
  message: string;
  token: string;
  user: AuthUser;
  role: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  adminPermissionCode?: string;
  invite_token?: string;
}

export interface SignUpResponse {
  message: string;
  user: AuthUser;
  role: string;
}

export interface AuthMeResponse {
  user: AuthUser;
  role: string;
  access_level: 'member' | 'admin';
}

export interface Event {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_type: string | null;
  created_by: string | null;
}

export interface EventCreatePayload {
  title: string;
  description?: string | null;
  location?: string | null;
  event_date: string;
  event_type?: 'general_meeting' | 'food_drive' | 'other' | null;
}

export interface EventUpdatePayload {
  title?: string;
  description?: string | null;
  location?: string | null;
  event_date?: string;
  event_type?: 'general_meeting' | 'food_drive' | 'other' | null;
}

export interface InviteTokenRecord {
  id: string;
  created_at: string;
  created_by: string;
  expires_at: string;
  used_at: string | null;
  used_by: string | null;
}

export interface InviteCreateResponse {
  invite_url: string;
  invite_id: string;
  expires_at: string;
}

export interface InviteValidationResponse {
  valid: boolean;
}

function mapSponsorTier(amount: number): SponsorCard['tier'] {
  if (amount >= 10000) return 'platinum';
  if (amount >= 5000) return 'gold';
  if (amount >= 2500) return 'silver';
  if (amount >= 1000) return 'bronze';
  return 'community';
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getHomeStats(): Promise<HomeStats> {
  const stats = await apiRequest<HomeStats>('/api/stats/home');
  return {
    money_raised: toNumber(stats.money_raised),
    meals_donated: toNumber(stats.meals_donated),
    active_volunteers: toNumber(stats.active_volunteers),
    delivery_count: toNumber(stats.delivery_count),
    sponsor_count: toNumber(stats.sponsor_count),
    fundraising_goal: toNumber(stats.fundraising_goal),
  };
}

export async function getSponsors(): Promise<SponsorCard[]> {
  const sponsors = await apiRequest<SponsorApiRecord[]>('/api/sponsors');

  return sponsors.map((sponsor) => ({
    id: String(sponsor.sponsor_id),
    company_name: sponsor.sponsor_name,
    logo_url: sponsor.sponsor_picture ?? '',
    website_url: '',
    tier: mapSponsorTier(toNumber(sponsor.amount)),
    contribution_amount: toNumber(sponsor.amount),
    description: sponsor.sponsor_description,
    active: true,
  }));
}

export async function getStoreItems(): Promise<ShopItemCard[]> {
  const items = await apiRequest<StoreItemApiRecord[]>('/api/items');

  return items.map((item) => {
    const stockQuantity = toNumber(item.stock);

    return {
      id: String(item.item_id),
      name: item.name,
      description: item.description,
      price: toNumber(item.price),
      image_url: item.img ?? '',
      category: 'general',
      sizes_available: [],
      in_stock: stockQuantity > 0,
      stock_quantity: stockQuantity,
    };
  });
}

export async function getAdvocacyUpdates(): Promise<AdvocacyUpdate[]> {
  const updates = await apiRequest<AdvocacyUpdate[]>('/api/advocacy-updates');
  return updates.map((update) => ({
    ...update,
    id: String(update.id),
  }));
}

export async function getEvents(upcomingOnly = true, limit = 20, offset = 0): Promise<Event[]> {
  const params = new URLSearchParams();
  if (upcomingOnly) params.set('upcoming', 'true');
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  const query = params.toString();
  const path = query ? `/api/events?${query}` : '/api/events';
  const events = await apiRequest<Event[]>(path);

  return events.map((event) => ({
    ...event,
    id: String(event.id),
  }));
}

export async function createEvent(payload: EventCreatePayload, authToken?: string): Promise<Event> {
  const token = authToken ?? getStoredAuthToken();
  if (!token) {
    throw new Error('Please log in again to create an event.');
  }

  return apiRequest<Event>('/api/events', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateEvent(
  eventId: string,
  payload: EventUpdatePayload,
  authToken?: string
): Promise<Event> {
  const token = authToken ?? getStoredAuthToken();
  if (!token) {
    throw new Error('Please log in again to update an event.');
  }

  return apiRequest<Event>(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'PUT',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteEvent(eventId: string, authToken?: string): Promise<{ message: string }> {
  const token = authToken ?? getStoredAuthToken();
  if (!token) {
    throw new Error('Please log in again to delete an event.');
  }

  return apiRequest<{ message: string }>(`/api/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
  });
}

export async function createInvite(authToken?: string): Promise<InviteCreateResponse> {
  const token = authToken ?? getStoredAuthToken();
  if (!token) {
    throw new Error('Please log in again to generate an invite.');
  }

  return apiRequest<InviteCreateResponse>('/api/invite', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({}),
  });
}

export async function getPendingInvites(authToken?: string): Promise<InviteTokenRecord[]> {
  const token = authToken ?? getStoredAuthToken();
  if (!token) {
    throw new Error('Please log in again to view pending invites.');
  }

  return apiRequest<InviteTokenRecord[]>('/api/invite', {
    headers: buildAuthHeaders(token),
  });
}

export async function revokeInvite(tokenId: string, authToken?: string): Promise<{ message: string }> {
  const token = authToken ?? getStoredAuthToken();
  if (!token) {
    throw new Error('Please log in again to revoke an invite.');
  }

  return apiRequest<{ message: string }>(`/api/invite/${encodeURIComponent(tokenId)}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
  });
}

export async function validateInvite(tokenId: string): Promise<InviteValidationResponse> {
  return apiRequest<InviteValidationResponse>(`/api/invite/${encodeURIComponent(tokenId)}`);
}

export async function getDeliveries(limit?: number): Promise<DeliveryLog[]> {
  const query = limit ? `?limit=${encodeURIComponent(String(limit))}` : '';
  const deliveries = await apiRequest<DeliveryLog[]>(`/api/deliveries${query}`);

  return deliveries.map((delivery) => ({
    ...delivery,
    lat: delivery.lat == null ? null : toNumber(delivery.lat),
    lng: delivery.lng == null ? null : toNumber(delivery.lng),
    items: Array.isArray(delivery.items) ? delivery.items : [],
  }));
}

export async function createDelivery(payload: DeliveryCreatePayload): Promise<DeliveryLog> {
  const token = getStoredAuthToken();
  if (!token) {
    throw new Error('Please log in to log a delivery.');
  }

  return apiRequest<DeliveryLog>('/api/deliveries', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteDelivery(deliveryId: string): Promise<{ message: string }> {
  const token = getStoredAuthToken();
  if (!token) {
    throw new Error('Please log in to request delivery deletion.');
  }

  const normalizedId = String(deliveryId ?? '').trim();
  if (!normalizedId) {
    throw new Error('Delivery id is required.');
  }

  return apiRequest<{ message: string }>(`/api/deliveries/${encodeURIComponent(normalizedId)}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
  });
}

export async function getAuthMe(authToken?: string): Promise<AuthMeResponse> {
  const token = authToken ?? getStoredAuthToken();
  if (!token) {
    throw new Error('No active session found. Please log in.');
  }

  return apiRequest<AuthMeResponse>('/api/auth/me', {
    headers: buildAuthHeaders(token),
  });
}

export async function getVolunteerSummary(): Promise<VolunteerSummary> {
  return apiRequest<VolunteerSummary>('/api/volunteers/summary');
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  return apiRequest<SignInResponse>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  return apiRequest<SignUpResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function checkout(items: { id: number | string; qty: number }[]): Promise<{ url: string }> {
  return apiRequest<{ url: string }>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}
