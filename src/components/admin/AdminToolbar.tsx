// src/components/admin/AdminToolbar.tsx
import React from "react";

export type AdminTab = "orders" | "reviews" | "products" | "users";

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-xl border text-sm transition",
        active
          ? "bg-white/10 border-white/20 text-white"
          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function AdminToolbar({
  title = "Admin Dashboard",
  subtitle = "Orders, reviews moderation, product status, user active.",
  tab,
  onChangeTab,
  right,
}: {
  title?: string;
  subtitle?: string;
  tab: AdminTab;
  onChangeTab: (t: AdminTab) => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="text-sm text-white/60">{subtitle}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TabBtn active={tab === "orders"} onClick={() => onChangeTab("orders")}>
          Orders
        </TabBtn>
        <TabBtn active={tab === "reviews"} onClick={() => onChangeTab("reviews")}>
          Reviews
        </TabBtn>
        <TabBtn active={tab === "products"} onClick={() => onChangeTab("products")}>
          Products
        </TabBtn>
        <TabBtn active={tab === "users"} onClick={() => onChangeTab("users")}>
          Users
        </TabBtn>

        {right ? <div className="ml-2">{right}</div> : null}
      </div>
    </div>
  );
}
