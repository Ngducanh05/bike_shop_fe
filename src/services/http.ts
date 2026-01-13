// src/services/http.ts
import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

type TokenPair = { accessToken: string; refreshToken: string };

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

function debug(msg: string, data?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[HTTP] ${msg}`, data ?? "");
  }
}

// accessToken: localStorage (đúng với code hiện tại)
export function getAccessToken() {
  const t = localStorage.getItem(ACCESS_KEY) || "";
  debug("getAccessToken", t ? "exists" : "empty");
  return t;
}

export function setAccessToken(token: string) {
  debug("setAccessToken", token ? "set" : "clear");
  if (!token) localStorage.removeItem(ACCESS_KEY);
  else localStorage.setItem(ACCESS_KEY, token);
}

// refreshToken: localStorage
export function getRefreshToken() {
  const t = localStorage.getItem(REFRESH_KEY) || "";
  debug("getRefreshToken", t ? "exists" : "empty");
  return t;
}

function setRefreshToken(token: string) {
  debug("setRefreshToken", token ? "set" : "clear");
  if (!token) localStorage.removeItem(REFRESH_KEY);
  else localStorage.setItem(REFRESH_KEY, token);
}

export function persistTokens(tokens: TokenPair) {
  debug("persistTokens");
  setAccessToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken);
}

export function clearTokens() {
  debug("clearTokens");
  // FIX: accessToken đang lưu localStorage, không phải sessionStorage
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    debug("request attach token", config.url);
  } else {
    debug("request without token", config.url);
  }
  if ((config.url || "").includes("/api/cart")) {
  console.log("[HTTP][CART] method =", config.method, "url =", config.url, "data =", config.data);
}
  return config;
});

let isRefreshing = false;
let queue: Array<(newToken: string) => void> = [];

function enqueue(cb: (newToken: string) => void) {
  debug("enqueue retry");
  queue.push(cb);
}

function flush(newToken: string) {
  debug("flush queue", { size: queue.length, hasToken: !!newToken });
  for (const cb of queue) cb(newToken);
  queue = [];
}

async function doRefresh(refreshToken: string): Promise<TokenPair> {
  debug("doRefresh start");
  const res = await axios.post<TokenPair>(
    `${API_BASE_URL}/api/auth/refresh`,
    { refreshToken },
    { timeout: 15000 }
  );
  debug("doRefresh success");
  return res.data;
}

http.interceptors.response.use(
  (res) => {
    debug("response ok", res.config.url);
    return res;
  },
  async (err: AxiosError) => {
    const status = err.response?.status;
    const original = err.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    debug("response error", { url: original?.url, status });

    if (!original || status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    const url = original.url || "";

    // không refresh cho auth endpoints
    if (
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/register") ||
      url.includes("/api/auth/refresh") ||
      url.includes("/api/auth/logout")
    ) {
      return Promise.reject(err);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(err);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueue((newToken) => {
          if (!newToken) return reject(err);
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(http(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const tokens = await doRefresh(refreshToken);
      persistTokens(tokens);
      flush(tokens.accessToken);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return http(original);
    } catch (e) {
      clearTokens();
      flush("");
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
