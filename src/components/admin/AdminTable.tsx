// src/components/admin/AdminTable.tsx
import React from "react";

export type AdminCol<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

export function AdminTable<T>({
  rows,
  cols,
  rowKey,
  loading,
  emptyText = "No data.",
}: {
  rows: T[];
  cols: AdminCol<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyText?: string;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        Loading…
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                className={[
                  "p-3 text-left text-xs font-semibold tracking-wide text-white/70",
                  c.className ?? "",
                ].join(" ")}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-t border-white/10">
              {cols.map((c) => (
                <td key={c.key} className={["p-3 align-top", c.className ?? ""].join(" ")}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
