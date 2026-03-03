import { getEcoScoreResult } from "@/lib/eco-score";
import { cn } from "@/lib/utils";

interface EcoScoreBadgeProps {
  score: number;
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function EcoScoreBadge({ score, compact = false, showLabel = false, className }: EcoScoreBadgeProps) {
  const result = getEcoScoreResult(score);

  if (compact) {
    return (
      <span
        className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white", className)}
        style={{ backgroundColor: result.color }}
        title={result.label}
      >
        🌱 {score}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[#0a0a0a]">Eco-Score</span>
        <span className="font-bold" style={{ color: result.color }}>
          {score}/100 — {result.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-[#e5e5e5] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: result.color }}
        />
      </div>

      {showLabel && (
        <p className="text-xs text-[#6b6b6b]">{result.description}</p>
      )}
    </div>
  );
}
