import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getOrders, createOrder, type Order } from "../services/order.api";
import { Page } from "../components/motion";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import OrderCard from "../components/order/OrderCard";

export default function Orders() {
  const nav = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await getOrders();
      setOrders(Array.isArray(list) ? list : []);
    } catch (e: any) {
      const status = e?.response?.status;
      setError(status ? `Failed to load orders (HTTP ${status})` : "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function createFromCart() {
    setCreating(true);
    setError(null);
    try {
      // tạm thời dummy shipping, làm checkout sau
      await createOrder({
        full_name: "Guest",
        phone: "0000000000",
        address_line: "TBD",
      });
      await load();
    } catch (e: any) {
      const status = e?.response?.status;
      setError(status ? `Create order failed (HTTP ${status})` : "Create order failed");
    } finally {
      setCreating(false);
    }
  }

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
        <EmptyState title="Orders" desc={error} />
      </Page>
    );
  }

  return (
    <Page>
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Đơn hàng</h1>

          <button
            onClick={createFromCart}
            disabled={creating}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {creating ? "Đang tạo..." : "Tạo đơn từ giỏ"}
          </button>
        </div>

        {orders.length === 0 ? (
          <EmptyState title="Chưa có đơn hàng" desc="Bạn chưa tạo đơn hàng nào." />
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderCard
                key={o.order_id}
                order={o}
                onView={(id) => nav(`/orders/${id}`)}
                onDeleted={load}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
