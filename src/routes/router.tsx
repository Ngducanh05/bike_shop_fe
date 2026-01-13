// src/routes/router.tsx
import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/Home";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";
import Admin from "../pages/Admin";

import { authStore } from "../store/auth.store";
import { getRefreshToken } from "../services/http";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const hasRt = !!getRefreshToken();

  const subscribe = React.useCallback((cb: () => void) => authStore.subscribe(cb), []);
  const getSnap = React.useCallback(() => authStore.getSnapshot(), []);

  const snap = React.useSyncExternalStore(subscribe, getSnap, getSnap);

  React.useEffect(() => {
    if (!snap.isAuthenticated && hasRt) authStore.hydrate();
  }, [snap.isAuthenticated, hasRt]);

  if (snap.loading) return null;

  return snap.isAuthenticated || hasRt ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },

      // product detail
      { path: "products/:slug", element: <ProductDetail /> },

      {
        path: "cart",
        element: (
          <RequireAuth>
            <Cart />
          </RequireAuth>
        ),
      },
      {
        path: "orders",
        element: (
          <RequireAuth>
            <Orders />
          </RequireAuth>
        ),
      },
      {
        path: "admin",
        element: (
          <RequireAuth>
            <Admin />
          </RequireAuth>
        ),
      },
    ],
  },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);
