import { http } from "./http";
import type { OrderStatus } from "./order.api";

export type ReviewStatus = "pending" | "approved" | "rejected";
export type ProductStatus = "draft" | "active" | "hidden" | "archived";

export type AdminReviewItem = {
  review_id: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  user_id: string;
  user_email: string;
  rating: number;
  comment?: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
};

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const res = await http.post("/api/admin/orders/status", { orderId, status });
  return res.data;
}

export async function toggleUserActive(targetUserId: string, isActive: boolean) {
  const res = await http.post("/api/admin/users/active", {
    targetUserId,
    isActive,
  });
  return res.data;
}

// ===== Reviews moderation =====
export async function getReviews(params?: {
  status?: ReviewStatus;
  productId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}) {
  const res = await http.get<{ items: AdminReviewItem[] }>("/api/admin/reviews", {
    params,
  });
  return res.data.items ?? [];
}

export async function setReviewStatus(reviewId: string, status: "approved" | "rejected") {
  const res = await http.post("/api/admin/reviews/status", { reviewId, status });
  return res.data;
}

// ===== Product status moderation =====
export async function setProductStatus(productId: string, status: ProductStatus) {
  const res = await http.post("/api/admin/products/status", { productId, status });
  return res.data;
}
