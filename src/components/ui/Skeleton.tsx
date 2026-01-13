import { cn } from "../../lib/cn";

export default function Skeleton({
  className,
  rounded = "xl",
}: {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/8",
        `rounded-${rounded}`,
        className
      )}
    >
      <div
        className="absolute inset-0 -translate-x-full
                   bg-gradient-to-r
                   from-transparent via-white/15 to-transparent
                   animate-[shimmer_1.4s_infinite]"
      />
    </div>
  );
}
