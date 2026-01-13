// src/services/auth.api.ts
import { http, getRefreshToken } from "./http"; // thêm getRefreshToken

type LoginReq = { email: string; password: string };
type RegisterReq = { email: string; password: string };
type TokenPair = { accessToken: string; refreshToken: string };

function debug(msg: string, data?: unknown) {
  if (import.meta.env.DEV) console.log(`[AUTH.API] ${msg}`, data ?? "");
}

export async function login(payload: LoginReq): Promise<TokenPair> {
  debug("login request", payload.email);
  const res = await http.post<TokenPair>("/api/auth/login", payload);
  debug("login success");
  return res.data;
}

export async function register(payload: RegisterReq) {
  debug("register request", payload.email);
  const res = await http.post("/api/auth/register", payload);
  debug("register success");
  return res.data;
}

// ✅ logout không cần truyền param nữa
export async function logout() {
  const refreshToken = getRefreshToken();
  debug("logout request", refreshToken ? "has token" : "missing token");

  // không có token thì khỏi gọi backend
  if (!refreshToken) return { ok: true, skipped: true };

  const res = await http.post("/api/auth/logout", { refreshToken });
  debug("logout success");
  return res.data;
}
