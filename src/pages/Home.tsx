import { useEffect, useMemo, useState } from "react";
import { http } from "../services/http";
import { Page } from "../components/motion";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ProductGrid from "../components/product/ProductGrid";
import { Button } from "../components/ui/Button";
import type { ProductStatus } from "../components/product/ProductCard";

type Product = {
  product_id: string;
  name: string;
  price: string | number;
  slug?: string;
  main_image?: string;
  status?: ProductStatus;
};

function debug(msg: string, data?: unknown) {
  if (import.meta.env.DEV) console.log(`[HOME] ${msg}`, data ?? "");
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      debug("fetch products start");
      try {
        const res = await http.get<{ items: Product[] }>("/api/products");
        setProducts(res.data.items ?? []);
        debug("fetch products success", res.data.items?.length ?? 0);
      } catch (e) {
        debug("fetch products error", e);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => p.name.toLowerCase().includes(s));
  }, [products, q]);

  return (
    <Page>
      <section className="mb-8">
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="text-sm text-white/60">New season</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Find your next ride</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Clean UI. Fast browse. Smooth motion.
            </p>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search product..."
                className="h-11 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm
                           outline-none placeholder:text-white/35 focus:border-white/20"
              />
              <button
                onClick={() => setQ("")}
                className="h-11 rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Clear
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Không tải được sản phẩm"
          desc={error}
          action={
            <Button variant="blue" onClick={() => window.location.reload()}>
              Reload
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Không có sản phẩm"
          desc="Thử tìm từ khóa khác."
          action={
            <button
              onClick={() => setQ("")}
              className="h-11 rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Xóa tìm kiếm
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Products</h2>
            <div className="text-sm text-white/50">{filtered.length} items</div>
          </div>

          <ProductGrid products={filtered} />
        </>
      )}
    </Page>
  );
}
