// src/pages/Admin.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { http } from "../services/http";

import { AdminToolbar } from "../components/admin/AdminToolbar";
import { AdminTable, type AdminCol } from "../components/admin/AdminTable";
import { AdminStatusSelect } from "../components/admin/AdminStatusSelect";

import { ReviewsAdmin } from "./admin/ReviewsAdmin";
import { ProductsAdmin } from "./admin/ProductsAdmin";
import { UsersAdmin } from "./admin/UsersAdmin";

type Tab = "orders" | "reviews" | "products" | "users";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

type Order = {
  order_id: string;
  status: OrderStatus;
};

const STATUS_OPTIONS: readonly OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
] as const;

function debug(msg: string, data?: unknown) {
  if (import.meta.env.DEV) console.log(`[ADMIN] ${msg}`, data ?? "");
}

function patchOrder(orders: Order[], order_id: string, patch: Partial<Order>) {
  const idx = orders.findIndex((o) => o.order_id === order_id);
  if (idx === -1) return orders;
  const next = orders.slice();
  next[idx] = { ...next[idx], ...patch };
  return next;
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>("orders");

  // orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const prevStatusRef = useRef<Record<string, OrderStatus>>({});
  const mountedRef = useRef(true);

  const ordersCount = useMemo(() => orders.length, [orders]);

  const setSavingFor = useCallback((order_id: string, v: boolean) => {
    setSaving((m) => (m[order_id] === v ? m : { ...m, [order_id]: v }));
  }, []);

  const loadOrders = useCallback(async () => {
    debug("loadOrders");
    setLoadingOrders(true);
    setBannerError(null);

    const controller = new AbortController();

    try {
      const res = await http.get<{ items: Order[] }>("/api/admin/orders", {
        signal: controller.signal,
      });

      if (!mountedRef.current) return;
      setOrders(res.data?.items ?? []);
      debug("loadOrders ok", res.data?.items?.length ?? 0);
    } catch (e: any) {
      if (!mountedRef.current) return;
      if (e?.name === "CanceledError" || e?.name === "AbortError") return;
      debug("loadOrders error", e);
      setBannerError(
        e?.response?.data?.message || "Failed to load orders (admin only)"
      );
    } finally {
      if (!mountedRef.current) return;
      setLoadingOrders(false);
    }

    return () => controller.abort();
  }, []);

  const updateOrderStatus = useCallback(
    async (order_id: string, nextStatus: OrderStatus) => {
      setBannerError(null);
      setSavingFor(order_id, true);

      setOrders((curr) => {
        const found = curr.find((o) => o.order_id === order_id);
        if (found) prevStatusRef.current[order_id] = found.status;
        return patchOrder(curr, order_id, { status: nextStatus });
      });

      try {
        await http.post("/api/admin/orders/status", {
          orderId: order_id,
          status: nextStatus,
        });
        debug("updateOrderStatus ok", { order_id, nextStatus });
      } catch (e: any) {
        debug("updateOrderStatus error", e);
        const prev = prevStatusRef.current[order_id];
        if (prev) setOrders((curr) => patchOrder(curr, order_id, { status: prev }));
        setBannerError(e?.response?.data?.message || "Update order failed");
      } finally {
        setSavingFor(order_id, false);
      }
    },
    [setSavingFor]
  );

  useEffect(() => {
    mountedRef.current = true;

    if (tab !== "orders") {
      setLoadingOrders(false);
      return () => {
        mountedRef.current = false;
      };
    }

    const cleanupPromise = loadOrders();
    return () => {
      mountedRef.current = false;
      cleanupPromise?.then((cleanup) => {
        if (typeof cleanup === "function") cleanup();
      });
    };
  }, [tab, loadOrders]);

  const cols: AdminCol<Order>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Order ID",
        className: "w-[420px]",
        render: (o) => <div className="font-mono text-xs text-white/90">{o.order_id}</div>,
      },
      {
        key: "status",
        header: "Status",
        className: "w-[220px]",
        render: (o) => {
          const isSaving = !!saving[o.order_id];
          return (
            <div className="flex items-center gap-3">
              <AdminStatusSelect
                value={o.status}
                options={STATUS_OPTIONS}
                disabled={isSaving}
                onChange={(v) => updateOrderStatus(o.order_id, v)}
                className="max-w-[200px]"
              />
              {isSaving ? <span className="text-xs text-white/60">Saving…</span> : null}
            </div>
          );
        },
      },
    ],
    [saving, updateOrderStatus]
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <AdminToolbar
        tab={tab}
        onChangeTab={setTab}
        right={
          tab === "orders" ? (
            <button
              onClick={() => loadOrders()}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
            >
              Refresh
            </button>
          ) : null
        }
      />

      {bannerError ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-red-300 text-sm">
          {bannerError}
        </div>
      ) : null}

      {tab === "orders" && (
        <>
          <div className="text-sm text-white/70">{ordersCount} orders</div>
          <AdminTable
            rows={orders}
            cols={cols}
            rowKey={(o) => o.order_id}
            loading={loadingOrders}
            emptyText="No orders yet."
          />
        </>
      )}

      {tab === "reviews" && <ReviewsAdmin />}
      {tab === "products" && <ProductsAdmin />}
      {tab === "users" && <UsersAdmin />}
    </div>
  );
}
