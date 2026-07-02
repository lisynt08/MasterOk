import type {
  CategoryDTO,
  MasterListItemDTO,
  MasterDetailDTO,
  MastersQuery,
  OrderListDTO,
  ReviewWithMasterDTO,
  ServiceReviewDTO,
} from '@/lib/types';

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export function fetchCategories() {
  return jsonFetch<{ categories: CategoryDTO[] }>('/api/categories');
}

export function fetchMasters(q: MastersQuery = {}) {
  const sp = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) sp.set(k, String(v));
  });
  const qs = sp.toString();
  return jsonFetch<{ masters: MasterListItemDTO[]; total: number }>(
    `/api/masters${qs ? `?${qs}` : ''}`
  );
}

export function fetchMaster(id: string) {
  return jsonFetch<{ master: MasterDetailDTO }>(`/api/masters/${id}`);
}

export function fetchStats() {
  return jsonFetch<{
    masters: number;
    categories: number;
    reviews: number;
    orders: number;
    completedOrders: number;
  }>('/api/stats');
}

export interface CreateReviewPayload {
  masterId: string;
  authorName: string;
  rating: number;
  text: string;
  pros?: string;
  cons?: string;
  jobTitle?: string;
}

export function createReview(payload: CreateReviewPayload) {
  return jsonFetch<{ ok: boolean; review: any; masterRating: number; masterReviewsCount: number }>(
    '/api/reviews',
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

export interface CreateOrderPayload {
  masterId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  jobTitle: string;
  description: string;
  budget?: number;
  preferredDate?: string;
  address?: string;
}

export function createOrder(payload: CreateOrderPayload) {
  return jsonFetch<{ ok: boolean; orderId: string; status: string; createdAt: string; masterName: string }>(
    '/api/orders',
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

export interface AiRecommendation {
  master: MasterListItemDTO & { categoryName: string };
  reason: string;
}

export function askAssistant(message: string, history: { role: 'user' | 'assistant'; content: string }[] = []) {
  return jsonFetch<{
    answer: string;
    recommendations: AiRecommendation[];
    followupQuestion: string | null;
    error?: string;
  }>('/api/ai-assistant', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

// New API functions
export function fetchOrdersList() {
  return jsonFetch<{ orders: OrderListDTO[] }>('/api/orders/list');
}

export function fetchMasterReviews() {
  return jsonFetch<{ reviews: ReviewWithMasterDTO[] }>('/api/reviews/list');
}

export function fetchServiceReviews() {
  return jsonFetch<{ reviews: ServiceReviewDTO[] }>('/api/service-reviews');
}

export function createServiceReview(payload: { authorName: string; rating: number; text: string; pros?: string; cons?: string }) {
  return jsonFetch<{ ok: boolean; review: ServiceReviewDTO }>(
    '/api/service-reviews',
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

export function fetchChatHistory(orderId: string) {
  return jsonFetch<{ messages: any[] }>(`/api/chat?orderId=${orderId}`);
}

export function sendChatMessage(payload: { orderId: string; masterId: string; sender: string; text: string }) {
  return jsonFetch<{ message: any }>(
    '/api/chat',
    { method: 'POST', body: JSON.stringify(payload) }
  );
}