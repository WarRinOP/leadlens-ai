type SignalLevel = "High" | "Medium" | "Low" | "Strong" | "Moderate" | "Weak" | "None" | string;

interface SignalChipsProps {
  intent: SignalLevel;
  urgency: SignalLevel;
  budgetSignal: SignalLevel;
}

function getSignalColor(level: SignalLevel): string {
  if (["High", "Strong"].includes(level)) return "#22c55e";
  if (["Medium", "Moderate"].includes(level)) return "#f59e0b";
  return "#ef4444"; // Low, Weak, None
}

interface ChipProps {
  label: string;
  value: SignalLevel;
}

function Chip({ label, value }: ChipProps) {
  const color = getSignalColor(value);
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "#475569" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-semibold px-3 py-0.5 rounded-full border"
        style={{
          color,
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function SignalChips({ intent, urgency, budgetSignal }: SignalChipsProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <Chip label="Intent" value={intent} />
      <div className="w-px h-8 bg-[#252a35] flex-shrink-0" />
      <Chip label="Urgency" value={urgency} />
      <div className="w-px h-8 bg-[#252a35] flex-shrink-0" />
      <Chip label="Budget Signal" value={budgetSignal} />
    </div>
  );
}
