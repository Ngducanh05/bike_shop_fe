import { http } from "./http";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered" // FIX: thêm delivered
  | "completed"
  | "cancelled"
  | "refunded";

export type Order = {
  order_id: string;
  status: OrderStatus;
  placed_at?: string;
  updated_at?: string;
  subtotal?: number;
  shipping_fee?: number;
  discount?: number;
  total?: number;
  currency?: string;
};

export type Shipping = {
  full_name: string;
  phone: string;
  address_line: string;
  ward?: string;
  district?: string;
  province?: string;
  note?: string;
};

export async function getOrders(): Promise<Order[]> {
  const res = await http.get<{ items: Order[] }>("/api/orders");
  return res.data.items ?? [];
}

export async function createOrder(shipping: Shipping) {
  const res = await http.post("/api/orders", { shipping });
  return res.data;
}
export async function createOrderFromCart() {
  const res = await http.post("/api/orders", {}); // create from cart
  return res.data;
}
export async function deleteOrder(orderId: string) {
  const res = await http.delete(`/api/orders/${orderId}`);
  return res.data;
}


