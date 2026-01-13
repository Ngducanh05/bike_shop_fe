// src/services/auth.bootstrap.ts
import { http, getRefreshToken, persistTokens, clearTokens } from "./http";
import { authStore } from "../store/auth.store";

type TokenPair = { accessToken: string; refreshToken: string };

export async function bootstrapAuth(): Promise<void> {
  const rt = getRefreshToken();
  if (!rt) return;

  try {
    const res = await http.post<TokenPair>("/api/auth/refresh", { refreshToken: rt });
    persistTokens(res.data);
    // set state authed
    authStore.login(res.data);
  } catch {
    clearTokens();
    // state về false
    authStore.logout();
  }
}
