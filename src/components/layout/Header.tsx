import * as React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../lib/cn";
import { authStore } from "../../store/auth.store";
import { getAccessToken, getRefreshToken } from "../../services/http";

const baseLink = "text-sm px-3 py-2 rounded-xl transition";

type AuthSnap = {
  isAuthenticated: boolean;
  user: any;
  loading?: boolean;
};

// decode JWT payload to get email if store.user missing
function parseJwt(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function useAuthSnapSafe(): AuthSnap {
  // 1) Try reactive store if available
  const hasReactive =
    typeof (authStore as any).subscribe === "function" &&
    typeof (authStore as any).getSnapshot === "function";

  const snap = hasReactive
    ? (React.useSyncExternalStore(
        (authStore as any).subscribe,
        (authStore as any).getSnapshot,
        (authStore as any).getSnapshot
      ) as AuthSnap)
    : (((authStore as any).getState?.() ?? {
        isAuthenticated: false,
        user: null,
        loading: false,
      }) as AuthSnap);

  // 2) Fallback: tokens imply logged-in
  const hasToken = !!getAccessToken() || !!getRefreshToken();

  // 3) Fallback: derive user from accessToken JWT
  const derivedUser = React.useMemo(() => {
    const at = getAccessToken();
    if (!at) return null;
    const payload = parseJwt(at);
    // common keys: email, sub, user_id
    if (!payload) return null;
    return {
      email: payload.email ?? payload.user?.email ?? null,
      name: payload.name ?? payload.user?.name ?? null,
      user_id: payload.user_id ?? payload.sub ?? null,
      role: payload.role ?? payload.user?.role ?? null,
    };
  }, [snap.isAuthenticated, snap.user]); // re-eval when store changes

  return {
    loading: snap.loading ?? false,
    isAuthenticated: snap.isAuthenticated || hasToken,
    user: snap.user ?? derivedUser,
  };
}

export default function Header() {
  const nav = useNavigate();
  const snap = useAuthSnapSafe();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-white/10 ring-1 ring-white/10" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Bike Shop</div>
            <div className="text-[11px] text-white/50">Search. Cart. Order.</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            ["/", "Home"],
            ["/cart", "Cart"],
            ["/orders", "Orders"],
            ["/admin", "Admin"],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  baseLink,
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {snap.loading ? null : !snap.isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/account"
                title={snap.user?.email ?? ""}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                {String(snap.user?.email || snap.user?.name || "Account")}
              </Link>

              <button
                onClick={() => {
                  authStore.logout?.();
                  // fallback: if logout not implemented correctly, wipe tokens too
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  nav("/login");
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
