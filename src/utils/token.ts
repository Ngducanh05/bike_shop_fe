// src/utils/token.ts
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function getAccessToken(): string {
  return sessionStorage.getItem(ACCESS_KEY) || "";
}

export function setAccessToken(token: string) {
  if (!token) sessionStorage.removeItem(ACCESS_KEY);
  else sessionStorage.setItem(ACCESS_KEY, token);
}

export function getRefreshToken(): string {
  return localStorage.getItem(REFRESH_KEY) || "";
}

export function setRefreshToken(token: string) {
  if (!token) localStorage.removeItem(REFRESH_KEY);
  else localStorage.setItem(REFRESH_KEY, token);
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
