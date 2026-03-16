interface TierBadgeProps {
  tier: "Hot" | "Warm" | "Cold" | string;
  large?: boolean;
}

const tierConfig = {
  Hot: {
    label: "HOT LEAD",
    bg: "bg-[#22c55e]/10",
    border: "border-[#22c55e]/30",
    text: "text-[#22c55e]",
    glow: "shadow-[0_0_12px_#22c55e22]",
  },
  Warm: {
    label: "WARM LEAD",
    bg: "bg-[#f59e0b]/10",
    border: "border-[#f59e0b]/30",
    text: "text-[#f59e0b]",
    glow: "shadow-[0_0_12px_#f59e0b22]",
  },
  Cold: {
    label: "COLD LEAD",
    bg: "bg-[#ef4444]/10",
    border: "border-[#ef4444]/30",
    text: "text-[#ef4444]",
    glow: "shadow-[0_0_12px_#ef444422]",
  },
};

export function TierBadge({ tier, large = false }: TierBadgeProps) {
  const cfg = tierConfig[tier as keyof typeof tierConfig] ?? tierConfig.Cold;

  return (
    <span
      className={[
        "inline-flex items-center font-mono font-semibold uppercase tracking-widest rounded-full border",
        cfg.bg,
        cfg.border,
        cfg.text,
        cfg.glow,
        large ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-[11px]",
      ].join(" ")}
    >
      {cfg.label}
    </span>
  );
}
