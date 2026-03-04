"use client";

import { useState } from "react";
import { Table2, ChevronDown, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExperienceConfig, CoverageTableBinding, BenefitRow } from "@/types/ix";
import { formatSAR, cn } from "@/lib/utils";

interface Props {
  config: ExperienceConfig;
  index: number;
}

const COVER_LABELS: Record<string, string> = {
  DENTAL:     "Dental",
  OPTICAL:    "Optical",
  OUTPATIENT: "Outpatient",
};

const COVER_NOTES: Record<string, string> = {
  DENTAL:     "Covers routine check-ups, fillings, root canals, crowns, and extractions at in-network providers.",
  OPTICAL:    "Covers prescription lenses, frames, and contact lenses once per year.",
  OUTPATIENT: "Covers GP visits, specialist consultations, lab tests, and diagnostic imaging.",
};

function BenefitRowItem({ row }: { row: BenefitRow }) {
  const usedPct    = row.annual_limit ? (row.used / row.annual_limit) * 100 : 0;
  const isCritical = usedPct > 80;
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-200 overflow-hidden",
        row.is_highlighted ? "bg-white/5 border-white/15" : "bg-neutral-800/40 border-neutral-700/50",
        open && "border-neutral-600"
      )}
    >
      {/* Row header — always visible, clickable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {row.is_highlighted && (
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-slow shrink-0" />
          )}
          <span className={cn("text-sm font-medium", row.is_highlighted ? "text-white" : "text-neutral-200")}>
            {COVER_LABELS[row.cover_code] ?? row.label}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-xs text-neutral-400 tabular-nums">{formatSAR(row.remaining)} left</span>
          <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-500 transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>

      {/* Progress bar — always visible */}
      <div className="px-3 pb-3">
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
          <span className="text-xs text-neutral-500">{formatSAR(row.used)} used</span>
          <span className="text-xs text-neutral-500">of {formatSAR(row.annual_limit)}</span>
        </div>
      </div>

      {/* Expandable details */}
      {open && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-150 border-t border-neutral-700/50 px-3 pb-3 pt-3 space-y-3">
          {/* Breakdown chips */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-neutral-800 border border-neutral-700 p-2 text-center">
              <p className="text-[10px] text-neutral-500 mb-0.5">Total limit</p>
              <p className="text-xs font-bold text-neutral-200 tabular-nums">{formatSAR(row.annual_limit)}</p>
            </div>
            <div className="rounded-lg bg-neutral-800 border border-neutral-700 p-2 text-center">
              <p className="text-[10px] text-neutral-500 mb-0.5">Used</p>
              <p className={cn("text-xs font-bold tabular-nums", isCritical ? "text-amber-300" : "text-neutral-200")}>
                {formatSAR(row.used)}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
              <p className="text-[10px] text-emerald-500 mb-0.5">Remaining</p>
              <p className="text-xs font-bold text-emerald-300 tabular-nums">{formatSAR(row.remaining)}</p>
            </div>
          </div>

          {/* Coverage note */}
          {COVER_NOTES[row.cover_code] && (
            <div className="flex items-start gap-2 rounded-lg bg-neutral-800/60 px-2.5 py-2">
              <Info className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {COVER_NOTES[row.cover_code]}
              </p>
            </div>
          )}
        </div>
      )}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4 text-neutral-400" />
            <CardTitle className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
              Benefits Overview
            </CardTitle>
          </div>
          <span className="text-[10px] text-neutral-600">tap a row for details</span>
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
