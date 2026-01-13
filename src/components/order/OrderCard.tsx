import { useState } from "react";
import { Card, CardContent } from "../ui/Card";
import type { Order } from "../../services/order.api"; // đổi thành ../orders.api nếu file của ngươi tên khác
import { deleteOrder } from "../../services/order.api"; // đổi tên path cho khớp

function moneyOrPending(v?: number) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "Chưa tính";
  return n.toLocaleString("vi-VN") + "₫";
}

function fmtDate(s?: string) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("vi-VN");
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-300",
  paid: "bg-emerald-500/15 text-emerald-300",
  processing: "bg-blue-500/15 text-blue-300",
  shipped: "bg-indigo-500/15 text-indigo-300",
  delivered: "bg-purple-500/15 text-purple-300",
  completed: "bg-emerald-500/15 text-emerald-300",
  cancelled: "bg-rose-500/15 text-rose-300",
  refunded: "bg-zinc-500/15 text-zinc-300",
};

export default function OrderCard({
  order,
  onView,
  onDeleted,
}: {
  order: Order;
  onView?: (orderId: string) => void;
  onDeleted?: () => void;
}) {
  const badge = STATUS_BADGE[order.status] ?? "bg-white/10 text-white/80";
  const canDelete = order.status === "pending";

  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onDelete() {
    if (!canDelete) return;

    const ok = window.confirm("Xoá đơn hàng này? (chỉ xoá được khi pending)");
    if (!ok) return;

    try {
      setDeleting(true);
      setErr(null);
      await deleteOrder(order.order_id);
      onDeleted?.();
    } catch (e: any) {
      const status = e?.response?.status;
      setErr(status ? `Xoá thất bại (HTTP ${status})` : "Xoá thất bại");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-white truncate">#{order.order_id}</div>
            <div className="text-xs text-white/60">Đặt lúc: {fmtDate(order.placed_at)}</div>
            {order.updated_at && (
              <div className="text-xs text-white/40">Cập nhật: {fmtDate(order.updated_at)}</div>
            )}
          </div>

          <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${badge}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-white/70">
            Tạm tính
            <div className="font-semibold text-white">{moneyOrPending(order.subtotal)}</div>
          </div>
          <div className="text-white/70">
            Phí vận chuyển
            <div className="font-semibold text-white">{moneyOrPending(order.shipping_fee)}</div>
          </div>
          <div className="text-white/70">
            Giảm giá
            <div className="font-semibold text-white">{moneyOrPending(order.discount)}</div>
          </div>
          <div className="text-white/70">
            Tổng
            <div className="font-semibold text-white">{moneyOrPending(order.total)}</div>
          </div>
        </div>

        {err && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
            {err}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
            onClick={() => onView?.(order.order_id)}
          >
            Xem chi tiết
          </button>

          {canDelete && (
            <button
              type="button"
              disabled={deleting}
              onClick={onDelete}
              className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-400/20 disabled:opacity-60"
            >
              {deleting ? "Đang xoá..." : "Xoá đơn"}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
