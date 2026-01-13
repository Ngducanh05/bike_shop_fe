// src/types/cart.ts
export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

export type Cart = CartItem[];
