// src/pages/ProductDetail.tsx
import * as React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { http, getRefreshToken } from "../services/http";
import { upsertCartItem } from "../services/cart.api";
import { authStore } from "../store/auth.store";

import { Page } from "../components/motion";
import { Card, CardContent } from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

type ProductImage = { image_url: string; is_main: boolean };

type Product = {
  product_id: string;
  category_id?: string;
  name: string;
  slug: string;
  brand?: string;
  model?: string;
  bike_type?: string;
  description?: string;
  price: string | number;
  currency?: string;
  status?: string;
  category_slug?: string;
  images?: ProductImage[];
};

function resolveImage(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  if (path.startsWith("/uploads/")) return `${API}${path}`;
  if (path.startsWith("uploads/")) return `${API}/${path}`;

  return `${API}/uploads/${path}`;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const loc = useLocation();

  // auth snapshot
  const subscribe = React.useCallback((cb: () => void) => authStore.subscribe(cb), []);
  const getSnap = React.useCallback(() => authStore.getSnapshot(), []);
  const snap = React.useSyncExternalStore(subscribe, getSnap, getSnap);

  const hasRt = !!getRefreshToken();
  const canAdd = snap.isAuthenticated || hasRt;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function fetchDetail() {
      if (!slug) {
        if (alive) {
          setError("Invalid product");
          setLoading(false);
        }
        return;
      }

      try {
        if (alive) {
          setLoading(true);
          setError(null);
        }

        const res = await http.get(`/api/products/${slug}`);

        // API shape: { item: { ... } }
        const p =
          (res.data as any)?.item ??
          (res.data as any)?.product ??
          (res.data as any)?.data ??
          res.data;

        if (alive) setProduct(p as Product);
      } catch (e: any) {
        const status = e?.response?.status;
        if (alive)
          setError(status ? `Failed to load product (HTTP ${status})` : "Failed to load product");
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchDetail();
    return () => {
      alive = false;
    };
  }, [slug]);

  async function onAddToCart() {
    if (!product?.product_id) return;

    // require login
    if (!canAdd) {
      nav(`/login?redirect=${encodeURIComponent(loc.pathname)}`, { replace: true });
      return;
    }

    try {
      setAdding(true);
      setAddMsg(null);

      await upsertCartItem(product.product_id, qty);

      setAddMsg("Đã thêm vào giỏ.");
    } catch (e: any) {
      const status = e?.response?.status;
      setAddMsg(status ? `Thêm giỏ thất bại (HTTP ${status})` : "Thêm giỏ thất bại");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error) return <EmptyState title="Lỗi" desc={error} />;
  if (!product) return <EmptyState title="Không tìm thấy sản phẩm" />;

  const rawPrice = product.price ?? 0;
  const priceNum = typeof rawPrice === "string" ? Number(rawPrice) : rawPrice;

  const mainImg = product.images?.find((x) => x.is_main)?.image_url;
  const firstImg = product.images?.[0]?.image_url;
  const img = resolveImage(mainImg ?? firstImg) || "https://placehold.co/800x600?text=Bike";

  return (
    <Page>
      <Card className="mx-auto max-w-3xl">
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-black/40">
            <img src={img} alt={product.name} className="h-full w-full object-cover" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-white">{product.name}</h1>

            <div className="text-lg font-bold text-white">
              {(Number.isFinite(priceNum) ? priceNum : 0).toLocaleString("vi-VN")}₫
            </div>

            {product.description ? (
              <p className="text-sm text-white/70">{product.description}</p>
            ) : (
              <p className="text-sm text-white/50">Chưa có mô tả.</p>
            )}

            {(product.brand || product.model || product.bike_type) && (
              <div className="pt-2 text-sm text-white/70">
                {product.brand && <div>Brand: {product.brand}</div>}
                {product.model && <div>Model: {product.model}</div>}
                {product.bike_type && <div>Type: {product.bike_type}</div>}
              </div>
            )}

            {/* Add to cart */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5">
                <button
                  type="button"
                  className="px-3 py-2 text-white/80 disabled:opacity-50"
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  disabled={adding}
                >
                  -
                </button>

                <div className="w-10 select-none text-center text-white">{qty}</div>

                <button
                  type="button"
                  className="px-3 py-2 text-white/80 disabled:opacity-50"
                  onClick={() => setQty((v) => v + 1)}
                  disabled={adding}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={onAddToCart}
                disabled={adding || !canAdd}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
                title={!canAdd ? "Bạn cần đăng nhập để thêm vào giỏ" : undefined}
              >
                {!canAdd ? "Đăng nhập để thêm giỏ" : adding ? "Đang thêm..." : "Thêm vào giỏ"}
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = "/cart")}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
              >
                Xem giỏ
              </button>
            </div>

            {addMsg && <div className="mt-2 text-sm text-white/70">{addMsg}</div>}

            {!canAdd && (
              <div className="text-xs text-white/50">
                Bạn chưa đăng nhập. Hãy đăng nhập để thêm sản phẩm vào giỏ.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Page>
  );
}
