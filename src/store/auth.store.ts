// src/store/auth.store.ts
import { persistTokens, clearTokens } from "../services/http";
import { http } from "../services/http";

export type User = {
  user_id: string;
  email: string;
  name?: string | null;
  role?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
};

let state: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const setState = (patch: Partial<AuthState>) => {
  state = { ...state, ...patch };
  emit();
};

function debug(msg: string, data?: unknown) {
  if (import.meta.env.DEV) console.log(`[AUTH] ${msg}`, data ?? "");
}

export const authStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return state;
  },

  // alias cho code cũ nếu có
  getState() {
    return state;
  },

  async hydrate() {
  const hasAccess = !!sessionStorage.getItem("accessToken");
  setState({ loading: true, isAuthenticated: hasAccess });

  if (!hasAccess) {
    setState({ user: null, loading: false });
    return;
  }

  try {
    const res = await http.get<{ user: User }>("/api/auth/me");
    setState({ user: res.data.user, isAuthenticated: true, loading: false });
  } catch (e) {
    clearTokens();
    setState({ user: null, isAuthenticated: false, loading: false });
  }
},

  login(tokens: { accessToken: string; refreshToken: string }) {
    persistTokens(tokens);
    setState({ isAuthenticated: true });
    debug("login success");
  },

  async loadMe() {
    const res = await http.get<{ user: User }>("/api/auth/me");
    setState({ user: res.data.user, isAuthenticated: true });
  },

  logout() {
    clearTokens();
    setState({ isAuthenticated: false, user: null });
    debug("logout");
  },
};
