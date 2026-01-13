// src/pages/admin/ReviewsAdmin.tsx
import { useEffect, useMemo, useState } from "react";
import { getReviews, setReviewStatus } from "../../services/admin.api";
import type { AdminReviewItem } from "../../services/admin.api";
import { AdminTable, type AdminCol } from "../../components/admin/AdminTable";

export function ReviewsAdmin() {
  const [rows, setRows] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setMsg(null);
    getReviews({ status: "pending", limit: 50, offset: 0 })
      .then((items) => setRows(items))
      .catch((e: any) => setMsg(e?.response?.data?.message || "Load failed."))
      .finally(() => setLoading(false));
  }, []);

  async function moderate(reviewId: string, status: "approved" | "rejected") {
    setMsg(null);
    try {
      await setReviewStatus(reviewId, status);
      setRows((xs) => xs.map((r) => (r.review_id === reviewId ? { ...r, status } : r)));
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Action failed.");
    }
  }

  const pendingCount = useMemo(() => rows.filter((r) => r.status === "pending").length, [rows]);

  const cols: AdminCol<AdminReviewItem>[] = [
    {
      key: "product",
      header: "Product",
      render: (r) => (
        <div>
          <div className="font-semibold">{r.product_name}</div>
          <div className="text-xs text-white/60">{r.product_slug}</div>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      className: "w-[220px]",
      render: (r) => (
        <div>
          <div className="text-sm">{r.user_email}</div>
          <div className="text-xs text-white/60">{r.user_id}</div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      className: "w-[90px]",
      render: (r) => <div className="text-sm">{r.rating}/5</div>,
    },
    {
      key: "comment",
      header: "Comment",
      render: (r) => <div className="text-sm text-white/80">{r.comment ?? "-"}</div>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[190px]",
      render: (r) =>
        r.status !== "pending" ? (
          <span className="text-xs text-white/60">{r.status}</span>
        ) : (
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-emerald-600 text-sm"
              onClick={() => moderate(r.review_id, "approved")}
            >
              Approve
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-rose-600 text-sm"
              onClick={() => moderate(r.review_id, "rejected")}
            >
              Reject
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/70">{pendingCount} pending reviews</div>
      </div>

      {msg ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-red-300 text-sm">
          {msg}
        </div>
      ) : null}

      <AdminTable
        rows={rows}
        cols={cols}
        rowKey={(r) => r.review_id}
        loading={loading}
        emptyText="No reviews."
      />
    </div>
  );
}
