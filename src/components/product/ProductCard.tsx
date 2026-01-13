import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import Badge from "../ui/Badge";

export type ProductStatus = "active" | "draft" | "hidden" | "archived";

export default function ProductCard({
  slug,
  name,
  price,
  imageUrl,
  status = "active",
  className,
}: {
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  status?: ProductStatus;
  className?: string;
}) {
  const safePrice = Number.isFinite(price) ? price : 0;
  const isDisabled = status !== "active";

  return (
    <motion.div
      whileHover={{ y: isDisabled ? 0 : -4 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
        isDisabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      <Link to={`/products/${slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-white/40">
              No image
            </div>
          )}

          <div className="absolute left-3 top-3 flex gap-2">
            {status !== "active" ? (
              <Badge className="bg-rose-500/80 text-white">
                {status.toUpperCase()}
              </Badge>
            ) : (
              <Badge>New</Badge>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-sm font-semibold text-white">
              {name}
            </h3>
            <Badge className="bg-white/12">
              {safePrice.toLocaleString("vi-VN")}₫
            </Badge>
          </div>

          <div className="mt-2 text-xs text-white/55">
            {isDisabled ? "Sản phẩm tạm ngưng" : "Click để xem chi tiết"}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
