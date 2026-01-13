// src/pages/Cart.tsx
import { useEffect, useMemo, useState } from "react";
import { getCart, upsertCartItem, type CartItem } from "../services/cart.api";
import { Page } from "../components/motion";
import { Card, CardContent } from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

function resolveImage(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  if (path.startsWith("/uploads/")) return `${API}${path}`;
  if (path.startsWith("uploads/")) return `${API}/${path}`;
  return `${API}/uploads/${path}`;
}

function money(v: number) {
  return (Number.isFinite(v) ? v : 0).toLocaleString("vi-VN") + "₫";
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await getCart(); // GET /api/cart -> CartItem[]
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      const status = e?.response?.status;
      setError(status ? `Failed to load cart (HTTP ${status})` : "Failed to load cart");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function setQty(productId: string, qty: number) {
    try {
      setBusyId(productId);
      setError(null);

      // qty <= 0 -> remove by upsert qty=0 (your current BE style is POST upsert)
      await upsertCartItem(productId, Math.max(0, qty));

      // optimistic update (fast UI)
      setItems((prev) =>
        prev
          .map((it) => (it.product_id === productId ? { ...it, quantity: Math.max(0, qty) } : it))
          .filter((it) => it.quantity > 0)
      );
    } catch (e: any) {
      const status = e?.response?.status;
      setError(status ? `Failed to update cart (HTTP ${status})` : "Failed to update cart");
      // reload to sync
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const subtotal = useMemo(() => {
    return items.reduce((s, it) => s + (Number(it.price) || 0) * (it.quantity || 0), 0);
  }, [items]);

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Page>
        <EmptyState title="Cart" desc={error} />
      </Page>
    );
  }

  if (items.length === 0) {
    return (
      <Page>
        <EmptyState title="Cart trống" desc="Chưa có sản phẩm nào trong giỏ." />
      </Page>
    );
  }

  return (
    <Page>
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold text-white">Giỏ hàng</h1>
          <div className="text-sm text-white/70">{items.length} sản phẩm</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((it) => {
              const busy = busyId === it.product_id;
              const img = resolveImage(it.image_url) || "https://placehold.co/160x120?text=Bike";
              const unit = Number(it.price) || 0;
              const line = unit * (it.quantity || 0);

              return (
                <Card key={it.product_id} className={busy ? "opacity-70" : ""}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-black/40">
                      <img src={img} alt={it.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-white line-clamp-2">
                            {it.name || it.product_id}
                          </div>
                          <div className="mt-1 text-sm text-white/70">{money(unit)}</div>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-white">{money(line)}</div>
                          <button
                            type="button"
                            className="mt-2 text-xs text-white/70 hover:text-white"
                            onClick={() => setQty(it.product_id, 0)}
                            disabled={busy}
                          >
                            Xoá
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center rounded-xl border border-white/10 bg-white/5">
                          <button
                            type="button"
                            className="px-3 py-2 text-white/80 disabled:opacity-50"
                            onClick={() => setQty(it.product_id, (it.quantity || 0) - 1)}
                            disabled={busy}
                          >
                            -
                          </button>
                          <div className="w-10 select-none text-center text-white">
                            {it.quantity}
                          </div>
                          <button
                            type="button"
                            className="px-3 py-2 text-white/80 disabled:opacity-50"
                            onClick={() => setQty(it.product_id, (it.quantity || 0) + 1)}
                            disabled={busy}
                          >
                            +
                          </button>
                        </div>

                        {busy && <div className="text-xs text-white/60">Đang cập nhật...</div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="text-white font-semibold">Tóm tắt</div>

                <div className="flex justify-between text-sm text-white/80">
                  <span>Tạm tính</span>
                  <span className="text-white">{money(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm text-white/80">
                  <span>Phí vận chuyển</span>
                  <span className="text-white/70">Tính sau</span>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex justify-between text-base">
                  <span className="text-white font-semibold">Tổng</span>
                  <span className="text-white font-semibold">{money(subtotal)}</span>
                </div>

                <button
                  type="button"
                  className="mt-2 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
                  onClick={() => alert("TODO: Checkout")}
                >
                  Thanh toán
                </button>

                <button
                  type="button"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => (window.location.href = "/")}
                >
                  Tiếp tục mua
                </button>
              </CardContent>
            </Card>

            <div className="text-xs text-white/50">
              Ghi chú: Cart API hiện dùng POST upsert {`{ productId, qty }`}. Qty = 0 coi như xoá.
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
