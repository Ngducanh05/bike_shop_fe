// src/pages/admin/AdminPage.tsx
import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { ReviewsAdmin } from "./ReviewsAdmin";
import { ProductsAdmin } from "./ProductsAdmin";
import { UsersAdmin } from "./UsersAdmin";

export type AdminTab = "orders" | "reviews" | "products" | "users";

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("products");

  return (
    <AdminLayout tab={tab} onChangeTab={setTab}>
      {tab === "orders" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Orders đang dùng ở <code className="text-white">src/pages/Admin.tsx</code>.
        </div>
      )}
      {tab === "reviews" && <ReviewsAdmin />}
      {tab === "products" && <ProductsAdmin />}
      {tab === "users" && <UsersAdmin />}
    </AdminLayout>
  );
}
