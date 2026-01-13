// src/pages/admin/UsersAdmin.tsx
import { useMemo, useState } from "react";
import { toggleUserActive } from "../../services/admin.api";
import { AdminStatusSelect } from "../../components/admin/AdminStatusSelect";

type ActiveOpt = "active" | "inactive";
const ACTIVE_OPTIONS: readonly ActiveOpt[] = ["active", "inactive"] as const;

export function UsersAdmin() {
  const [userId, setUserId] = useState("");
  const [activeOpt, setActiveOpt] = useState<ActiveOpt>("active");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const isActive = activeOpt === "active";
  const canSubmit = useMemo(() => userId.trim().length > 0 && !loading, [userId, loading]);

  async function submit() {
    setLoading(true);
    setMsg(null);
    try {
      await toggleUserActive(userId.trim(), isActive);
      setMsg("Updated user active.");
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm text-white/70">User moderation</div>
        <div className="mt-1 text-lg font-semibold">Set user active</div>

        <div className="mt-4 grid gap-3">
          <div>
            <div className="mb-1 text-xs text-white/60">User ID (UUID)</div>
            <input
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-white border border-white/10
                         focus:outline-none focus:ring-2 focus:ring-white/10"
              placeholder="e.g. 8aff0490-..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-white/60">State</div>
            <AdminStatusSelect value={activeOpt} options={ACTIVE_OPTIONS} onChange={setActiveOpt} disabled={loading} />
          </div>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : "Apply"}
          </button>

          {msg ? <div className="text-sm text-white/70">{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}
