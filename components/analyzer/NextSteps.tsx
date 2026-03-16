interface NextStepsProps {
  steps: string[];
}

export function NextSteps({ steps }: NextStepsProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const num = String(idx + 1).padStart(2, "0");
        return (
          <div
            key={idx}
            className={[
              "flex items-start gap-4 py-4",
              !isLast ? "border-b border-[#252a35]" : "",
            ].join(" ")}
          >
            {/* Step number pill */}
            <span className="flex-shrink-0 font-mono text-[11px] font-semibold text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-full px-2.5 py-0.5 leading-5 select-none">
              {num}
            </span>
            {/* Step text */}
            <p className="text-sm text-[#94a3b8] leading-relaxed pt-0.5">
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}
