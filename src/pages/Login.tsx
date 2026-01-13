// src/pages/Login.tsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login as loginApi } from "../services/auth.api";
import { authStore } from "../store/auth.store";

function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getRedirect(loc: ReturnType<typeof useLocation>) {
  const sp = new URLSearchParams(loc.search);
  const redirect = sp.get("redirect") || "/";

  // basic safety: only allow internal paths
  if (!redirect.startsWith("/")) return "/";
  return redirect;
}

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();

  const redirect = useMemo(() => getRedirect(loc), [loc.search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailTrim = email.trim();

  const canSubmit = useMemo(() => {
    if (!isEmail(emailTrim)) return false;
    if (password.length < 1) return false;
    return !loading;
  }, [emailTrim, password, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Enter a valid email and password.");
      return;
    }

    setLoading(true);
    try {
      const tokens = await loginApi({ email: emailTrim, password });

      (authStore as any).login(tokens, { remember });

      // go back to intended page
      nav(redirect, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Check email or password.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <span className="text-lg font-bold">B</span>
              </div>
              <div>
                <div className="text-lg font-semibold">Welcome back</div>
                <div className="text-sm text-white/60">Login to continue to Bike Shop</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70">
              {redirect !== "/" ? "redirect" : "/login"}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Email</label>
              <div className="relative">
                <input
                  className={[
                    "w-full rounded-xl border bg-black/30 px-4 py-3 text-sm outline-none",
                    "border-white/10 focus:border-white/25",
                  ].join(" ")}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                />
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs">
                  <span className={isEmail(emailTrim) ? "text-emerald-300" : "text-white/40"}>
                    {emailTrim.length === 0 ? "" : isEmail(emailTrim) ? "OK" : "Invalid"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Password</label>
              <div className="relative">
                <input
                  className={[
                    "w-full rounded-xl border bg-black/30 px-4 py-3 pr-24 text-sm outline-none",
                    "border-white/10 focus:border-white/25",
                  ].join(" ")}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute inset-y-0 right-2 my-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/70 hover:bg-white/10"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-sm">
              <label className="flex items-center gap-2 text-white/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/40"
                />
                Remember me
              </label>

              <a className="text-white/70 hover:text-white hover:underline" href="/forgot-password">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              className={[
                "mt-1 w-full rounded-xl px-4 py-3 text-sm font-semibold",
                "bg-white text-black hover:bg-white/90",
                "disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-black/60",
              ].join(" ")}
              disabled={!canSubmit}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="pt-2 text-center text-sm text-white/60">
              No account?{" "}
              <a className="text-white hover:underline" href="/register">
                Create one
              </a>
            </div>

            <div className="pt-2 text-center text-xs text-white/40">
              By continuing, you agree to the Terms and Privacy Policy.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
