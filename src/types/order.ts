// src/types/order.ts
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "done"
  | "cancelled";

export type Order = {
  order_id: string;
  status: OrderStatus;
  created_at: string;
};
