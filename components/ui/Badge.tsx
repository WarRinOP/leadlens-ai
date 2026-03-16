import React from "react";

type BadgeVariant = "hot" | "warm" | "cold" | "accent" | "default";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  hot: "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/25",
  warm: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/25",
  cold: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/25",
  accent: "bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/25",
  default: "bg-[#1c2028] text-[#94a3b8] border border-[#252a35]",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  variant = "default",
  size = "md",
  children,
  className = "",
  mono = false,
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-semibold rounded-full uppercase tracking-wider",
        mono ? "font-mono" : "",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: "Hot" | "Warm" | "Cold" | string }) {
  const variant =
    tier === "Hot" ? "hot" : tier === "Warm" ? "warm" : "cold";
  return (
    <Badge variant={variant} mono>
      {tier} Lead
    </Badge>
  );
}
