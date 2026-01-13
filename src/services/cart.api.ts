// src/services/cart.api.ts
import { http } from "./http";

export type CartItem = {
  product_id: string;
  name?: string;
  price?: number;
  image_url?: string;
  quantity: number;
};

type CartRes = {
  cartId?: string;
  items?: CartItem[];
};

export async function getCart(): Promise<CartItem[]> {
  const res = await http.get<CartRes | CartItem[]>("/api/cart");

  // BE có thể trả:
  // 1) { cartId, items: [...] }
  // 2) [...] (nếu ai đó viết dạng list)
  const data: any = res.data;

  const items: CartItem[] =
    Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

  return items;
}

export async function upsertCartItem(productId: string, qty: number) {
  const res = await http.post("/api/cart/items", { productId, qty });
  return res.data;
}
