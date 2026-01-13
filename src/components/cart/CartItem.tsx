import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import Spinner from "../ui/Spinner";

export default function CartItem({
  name,
  price,
  quantity,
  imageUrl,
  loading,
  onIncrease,
  onDecrease,
  onRemove,
  className,
}: {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  loading?: boolean;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onRemove?: () => void;
  className?: string;
}) {
  const safePrice = Number.isFinite(price) ? price : 0;

  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur",
        className
      )}
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-black/40">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="line-clamp-2 text-sm font-semibold">{name}</div>
          <button
            onClick={onRemove}
            disabled={loading}
            className="text-xs text-white/50 hover:text-rose-400 transition"
          >
            Xóa
          </button>
        </div>

        <div className="text-sm text-white/70">
          {safePrice.toLocaleString("vi-VN")}₫
        </div>

        <div className="mt-auto flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={loading || quantity <= 1}
              onClick={onDecrease}
            >
              −
            </Button>

            <div className="min-w-[32px] text-center text-sm">
              {loading ? <Spinner className="mx-auto" /> : quantity}
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={onIncrease}
            >
              +
            </Button>
          </div>

          <div className="ml-auto text-sm font-semibold">
            {(safePrice * quantity).toLocaleString("vi-VN")}₫
          </div>
        </div>
      </div>
    </div>
  );
}
