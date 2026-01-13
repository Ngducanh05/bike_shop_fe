import { cn } from "../../lib/cn";

export default function EmptyState({
  title = "Không có dữ liệu",
  desc = "Thử đổi bộ lọc hoặc quay lại sau.",
  action,
  className,
}: {
  title?: string;
  desc?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-8 text-center",
        "animate-pop",
        className
      )}
    >
      <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white/10 ring-1 ring-white/10" />
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/60">{desc}</div>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
