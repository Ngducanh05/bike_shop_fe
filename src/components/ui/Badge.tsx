import { cn } from "../../lib/cn";

export default function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-xs text-white",
        className
      )}
    >
      {children}
    </span>
  );
}
