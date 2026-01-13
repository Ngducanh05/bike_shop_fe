// src/components/layout/NavbarRight.tsx
import * as React from "react";
import { Link } from "react-router-dom";
import { authStore } from "../../store/auth.store";

export default function NavbarRight() {
  const snap = React.useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getSnapshot
  );

  if (snap.loading) return null;

  if (!snap.isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="h-9 rounded-xl border border-white/15 bg-white/5 px-4 grid place-items-center text-sm font-semibold hover:bg-white/10"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="h-9 rounded-xl border border-white/15 bg-white/5 px-4 grid place-items-center text-sm font-semibold hover:bg-white/10"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/80">
        {snap.user?.name?.trim() || snap.user?.email || "Account"}
      </span>

      <button
        onClick={() => authStore.logout()}
        className="h-9 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold hover:bg-white/10"
      >
        Logout
      </button>
    </div>
  );
}
