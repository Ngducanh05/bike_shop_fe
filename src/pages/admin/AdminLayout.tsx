// src/pages/admin/AdminLayout.tsx
import React from "react";
import type { AdminTab } from "./AdminPage";
import { AdminToolbar } from "../../components/admin/AdminToolbar";

export default function AdminLayout({
  tab,
  onChangeTab,
  children,
}: {
  tab: AdminTab;
  onChangeTab: (t: AdminTab) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <AdminToolbar tab={tab} onChangeTab={onChangeTab} />
      <div className="space-y-6">{children}</div>
    </div>
  );
}
