// src/pages/admin/ProductsAdmin.tsx
import { useMemo, useState } from "react";
import { setProductStatus } from "../../services/admin.api";
import type { ProductStatus } from "../../services/admin.api";
import { AdminStatusSelect } from "../../components/admin/AdminStatusSelect";

const PRODUCT_STATUS: readonly ProductStatus[] = ["draft", "active", "hidden", "archived"] as const;

export function ProductsAdmin() {
  const [productId, setProductId] = useState("");
  const [status, setStatus] = useState<ProductStatus>("active");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => productId.trim().length > 0 && !loading, [productId, loading]);

  async function submit() {
    setLoading(true);
    setMsg(null);
    try {
      await setProductStatus(productId.trim(), status);
      setMsg("Updated product status.");
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm text-white/70">Product moderation</div>
        <div className="mt-1 text-lg font-semibold">Set product status</div>

        <div className="mt-4 grid gap-3">
          <div>
            <div className="mb-1 text-xs text-white/60">Product ID (UUID)</div>
            <input
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-white border border-white/10
                         focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="e.g. 7d107b03-..."
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-white/60">Status</div>
            <AdminStatusSelect value={status} options={PRODUCT_STATUS} onChange={setStatus} disabled={loading} />
          </div>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : "Apply"}
          </button>

          {msg ? (
            <div className="text-sm text-white/70">{msg}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
