import ProductCard from "./ProductCard";
import type { ProductStatus } from "./ProductCard";


type Product = {
  product_id: string;
  slug: string;
  name: string;
  price: string | number;
  main_image?: string; // "file.jpg"
  status?: ProductStatus;
};

function resolveImage(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const API = import.meta.env.VITE_API_BASE_URL || "https://bike-shop-fe-s6q6.onrender.com/";
  return `${API}/uploads/${path}`;
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const priceNum = typeof p.price === "string" ? Number(p.price) : p.price;

        return (
          <ProductCard
            key={p.product_id}
            slug={p.slug}
            name={p.name}
            price={Number.isFinite(priceNum) ? priceNum : 0}
            imageUrl={resolveImage(p.main_image)}
            status={p.status ?? "active"}
          />
        );
      })}
    </div>
  );
}
