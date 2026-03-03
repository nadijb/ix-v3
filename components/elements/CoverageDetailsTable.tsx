"use client";

import { Table2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExperienceConfig, CoverageTableBinding, BenefitRow } from "@/types/ix";
import { formatSAR, cn } from "@/lib/utils";

interface Props {
  config: ExperienceConfig;
  index: number;
}

const COVER_LABELS: Record<string, string> = {
  DENTAL: "Dental",
  OPTICAL: "Optical",
  OUTPATIENT: "Outpatient",
};

function BenefitRowItem({ row }: { row: BenefitRow }) {
  const usedPct = row.annual_limit ? (row.used / row.annual_limit) * 100 : 0;
  const isCritical = usedPct > 80;

  return (
    <div
      className={cn(
        "rounded-lg p-3 border transition-colors",
        row.is_highlighted
          ? "bg-white/5 border-white/15"
          : "bg-neutral-800/40 border-neutral-700/50"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {row.is_highlighted && (
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-slow" />
          )}
          <span className={cn("text-sm font-medium", row.is_highlighted ? "text-white" : "text-neutral-200")}>
            {COVER_LABELS[row.cover_code] ?? row.label}
          </span>
        </div>
        <span className="text-xs text-neutral-400">
          {formatSAR(row.remaining)} left
        </span>
      </div>
      <Progress
        value={usedPct}
        className="h-1.5"
        indicatorClassName={cn(
          row.is_highlighted
            ? isCritical ? "bg-amber-400" : "bg-white"
            : isCritical ? "bg-amber-500" : "bg-neutral-500"
        )}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-neutral-500">
          {formatSAR(row.used)} used
        </span>
        <span className="text-xs text-neutral-500">
          of {formatSAR(row.annual_limit)}
        </span>
      </div>
    </div>
  );
}

export function CoverageDetailsTable({ config, index }: Props) {
  const b = config.data_binding as CoverageTableBinding;

  return (
    <Card
      className={cn("animate-fade-in-up opacity-0")}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Table2 className="h-4 w-4 text-neutral-400" />
          <CardTitle className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
            Benefits Overview
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {b.rows?.map((row) => (
          <BenefitRowItem key={row.cover_code} row={row} />
        ))}
      </CardContent>
    </Card>
  );
}
