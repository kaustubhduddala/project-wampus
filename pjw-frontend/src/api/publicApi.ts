const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Request failed' }));
    const message = payload?.message ?? payload?.error ?? `Request failed with status ${response.status}`;
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
}

export interface SignUpResponse {
  message: string;
  user: AuthUser;
  role: string;
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
  return apiRequest<DeliveryLog>('/api/deliveries', {
    method: 'POST',
    body: JSON.stringify(payload),
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
