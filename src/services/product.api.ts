import { http } from "./http";
import type { Product } from "../types/product";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ProductReview = {
  review_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string | null;
  status?: ReviewStatus; // public list có thể không trả status
  created_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
};

export async function getProducts(params?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}) {
  const res = await http.get<{ items: Product[] }>("/api/products", { params });
  return res.data.items ?? [];
}

export async function getProductDetail(slug: string) {
  const res = await http.get<{ item: Product }>(`/api/products/${slug}`);
  return res.data.item;
}

// ===== Reviews (public + user create) =====

export async function getProductReviews(
  slug: string,
  params?: { limit?: number; offset?: number }
) {
  const res = await http.get<{ items: ProductReview[] }>(
    `/api/products/${slug}/reviews`,
    { params }
  );
  return res.data.items ?? [];
}

export async function createProductReview(
  slug: string,
  payload: { rating: number; comment?: string }
) {
  const res = await http.post<{ review: ProductReview }>(
    `/api/products/${slug}/reviews`,
    payload
  );
  return res.data.review;
}
