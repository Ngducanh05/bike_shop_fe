import React, { useMemo, useState } from "react";
import { register as registerApi } from "../services/auth.api";

function debug(msg: string, data?: unknown) {
  if (import.meta.env.DEV) console.log(`[REGISTER] ${msg}`, data ?? "");
}

function isEmail(email: string) {
  // đủ dùng, backend vẫn là nguồn sự thật
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailTrim = email.trim();

  const rules = useMemo(() => {
    const pw = password;

    const r = {
      emailValid: isEmail(emailTrim),
      lenMin: pw.length >= 8,
      lenMax: pw.length <= 72,
      confirmMatch: confirm.length > 0 && pw === confirm,
    };

    return r;
  }, [emailTrim, password, confirm]);

  const canSubmit =
    rules.emailValid && rules.lenMin && rules.lenMax && rules.confirmMatch && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    // chặn sớm cho UX, backend vẫn validate lại
    if (!canSubmit) {
      setError("Please satisfy all requirements before registering.");
      return;
    }

    setLoading(true);
    debug("submit", { email: emailTrim });

    try {
      await registerApi({ email: emailTrim, password });
      setOk(true);
      debug("register success");

      // optional: reset form
      // setEmail(""); setPassword(""); setConfirm("");
    } catch (err: any) {
      debug("register error", err);

      // nếu service dùng axios, thường có err.response?.data?.message
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Register failed. Please check your inputs.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  const Hint = ({
    ok,
    children,
  }: {
    ok: boolean;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start gap-2 text-sm">
      <span
        className={[
          "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border",
          ok
            ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
            : "border-white/10 bg-white/5 text-white/40",
        ].join(" ")}
        aria-hidden="true"
      >
        {ok ? "✓" : "•"}
      </span>
      <span className={ok ? "text-emerald-200/90" : "text-white/60"}>{children}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: brand / info */}
          <div className="hidden rounded-3xl border border-white/10 bg-white/5 p-8 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <span className="text-lg font-bold">B</span>
              </div>
              <div>
                <div className="text-lg font-semibold">Bike Shop</div>
                <div className="text-sm text-white/60">Create your account</div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="text-3xl font-semibold leading-tight">
                Fast checkout, order tracking, and member discounts.
              </div>
              <div className="text-white/60">
                Register with a valid email. Password must match backend rules.
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-sm font-semibold">Backend rules (current)</div>
              <div className="mt-3 space-y-2">
                <Hint ok={rules.emailValid}>Email must be a valid format.</Hint>
                <Hint ok={rules.lenMin}>Password length at least 8 characters.</Hint>
                <Hint ok={rules.lenMax}>Password length at most 72 characters.</Hint>
              </div>
              <div className="mt-4 text-xs text-white/50">
                If backend adds stronger rules later, UI should update to match.
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">Register</h1>
                <p className="mt-1 text-sm text-white/60">
                  Use your email and a password (8–72 chars).
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70">
                /register
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              {/* email */}
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
                    <span className={rules.emailValid ? "text-emerald-300" : "text-white/40"}>
                      {emailTrim.length === 0 ? "" : rules.emailValid ? "OK" : "Invalid"}
                    </span>
                  </div>
                </div>
              </div>

              {/* password */}
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
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute inset-y-0 right-2 my-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/70 hover:bg-white/10"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>

                {/* password hints */}
                <div className="mt-2 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Hint ok={rules.lenMin}>At least 8 characters.</Hint>
                  <Hint ok={rules.lenMax}>At most 72 characters.</Hint>
                </div>
              </div>

              {/* confirm */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Confirm password</label>
                <div className="relative">
                  <input
                    className={[
                      "w-full rounded-xl border bg-black/30 px-4 py-3 pr-24 text-sm outline-none",
                      "border-white/10 focus:border-white/25",
                    ].join(" ")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute inset-y-0 right-2 my-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/70 hover:bg-white/10"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>

                {confirm.length > 0 && (
                  <div
                    className={[
                      "rounded-xl border px-4 py-3 text-sm",
                      rules.confirmMatch
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                        : "border-rose-400/20 bg-rose-400/10 text-rose-200",
                    ].join(" ")}
                  >
                    {rules.confirmMatch ? "Passwords match." : "Passwords do not match."}
                  </div>
                )}
              </div>

              {/* server feedback */}
              {error && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}
              {ok && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  Register success. You can login now.
                </div>
              )}

              {/* submit */}
              <button
                className={[
                  "w-full rounded-xl px-4 py-3 text-sm font-semibold",
                  "bg-white text-black hover:bg-white/90",
                  "disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-black/60",
                ].join(" ")}
                disabled={!canSubmit}
              >
                {loading ? "Creating..." : "Create account"}
              </button>

              {/* footer */}
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>
                  Already have an account?{" "}
                  <a className="text-white hover:underline" href="/login">
                    Login
                  </a>
                </span>
                <span className="text-xs text-white/40">v1</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
