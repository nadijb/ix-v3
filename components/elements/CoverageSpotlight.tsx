"use client";

import { useState } from "react";
import { Stethoscope, CheckCircle2, AlertTriangle, Building2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExperienceConfig, CoverageSpotlightBinding } from "@/types/ix";
import { formatSAR, formatPct, cn } from "@/lib/utils";

interface Props {
  config: ExperienceConfig;
  index: number;
}

const INITIAL_SHOW = 3;

export function CoverageSpotlight({ config, index }: Props) {
  const b = config.data_binding as CoverageSpotlightBinding;
  const usedPct  = b.annual_limit ? (b.used_amount / b.annual_limit) * 100 : 0;
  const remaining = b.remaining ?? b.annual_limit - b.used_amount;
  const isCritical = usedPct > 80;

  const [showAll, setShowAll]         = useState(false);
  const [selectedTreatment, setSelected] = useState<string | null>(null);

  const treatments = b.included_treatments ?? [];
  const visible    = showAll ? treatments : treatments.slice(0, INITIAL_SHOW);
  const hasMore    = treatments.length > INITIAL_SHOW;

  return (
    <Card
      className={cn("animate-fade-in-up opacity-0")}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Stethoscope className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-sm">{b.cover_name}</CardTitle>
              <p className="text-xs text-neutral-500">{b.cover_code}</p>
            </div>
          </div>
          <Badge variant={b.is_covered ? "success" : "danger"}>
            {b.is_covered ? "Covered" : "Not Covered"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Benefit utilization */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-neutral-400">Benefit used</span>
            <span className="text-xs font-medium text-neutral-300">
              {formatSAR(b.used_amount)} / {formatSAR(b.annual_limit)}
            </span>
          </div>
          <Progress
            value={usedPct}
            className="h-2"
            indicatorClassName={cn(
              isCritical ? "bg-amber-500" : usedPct > 60 ? "bg-yellow-500" : "bg-emerald-500"
            )}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-500">{formatPct(usedPct)} used</span>
            <span className={cn("text-xs font-semibold", isCritical ? "text-amber-400" : "text-emerald-400")}>
              {formatSAR(remaining)} remaining
            </span>
          </div>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-2">
          {b.requires_pre_approval && (
            <div className="flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-xs text-amber-300">
              <AlertTriangle className="h-3 w-3" />
              Pre-approval required above SAR 1,000
            </div>
          )}
          {b.requires_network_provider && (
            <div className="flex items-center gap-1 rounded-md bg-neutral-800 border border-neutral-700 px-2 py-1 text-xs text-neutral-400">
              <Building2 className="h-3 w-3" />
              Network provider only
            </div>
          )}
        </div>

        {/* Included treatments — interactive pills */}
        {treatments.length > 0 && (
          <div>
            <p className="text-xs text-neutral-500 mb-2">Included treatments</p>
            <div className="flex flex-wrap gap-1.5">
              {visible.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelected(selectedTreatment === t ? null : t)}
                  className={cn(
                    "flex items-center gap-1 text-xs rounded-md px-2 py-0.5 border transition-all duration-150",
                    selectedTreatment === t
                      ? "dark:bg-white dark:text-black dark:border-white bg-neutral-900 text-white border-neutral-900"
                      : "bg-neutral-800/80 border-neutral-700/50 text-neutral-300 hover:border-neutral-500"
                  )}
                >
                  <CheckCircle2 className={cn("h-2.5 w-2.5 shrink-0", selectedTreatment === t ? "dark:text-black text-white" : "text-emerald-400")} />
                  {t}
                </button>
              ))}
            </div>

            {/* Selected treatment detail */}
            {selectedTreatment && (
              <div className="mt-2 animate-in fade-in duration-150 rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-3 py-2 text-xs text-neutral-300">
                <span className="font-medium dark:text-white text-neutral-900">{selectedTreatment}</span>
                {" "}is covered under your{" "}
                <span className="text-emerald-400">{b.cover_name}</span> benefit.
                Your remaining allowance is{" "}
                <span className="font-semibold text-emerald-300">{formatSAR(remaining)}</span>.
              </div>
            )}

            {/* Show more / less */}
            {hasMore && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-2 flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", showAll && "rotate-180")} />
                {showAll ? "Show less" : `Show ${treatments.length - INITIAL_SHOW} more`}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
