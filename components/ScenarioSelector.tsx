"use client";

import { Beaker } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScenarioPreset } from "@/types/ix";
import { cn } from "@/lib/utils";

export const SCENARIOS: ScenarioPreset[] = [
  {
    id: "1.1",
    label: "Baseline",
    description: "Open dental screen, no estimated cost",
    params: { member_id: 1 },
  },
  {
    id: "1.2",
    label: "With Cost",
    description: "SAR 4,500 root canal pre-filled",
    params: {
      member_id: 1,
      procedure_type: "root_canal",
      estimated_cost: 4500,
    },
  },
  {
    id: "1.3",
    label: "Anxious User",
    description: "High anxiety + hesitation → directive guidance",
    params: {
      member_id: 1,
      estimated_cost: 4500,
      ixb: {
        hesitation_detected: true,
        anxiety_signal: "high",
        decision_delay: "long",
        explain_click_rate: "high",
      },
    },
  },
  {
    id: "1.4",
    label: "Data-Driven",
    description: "Deep explorer, fast velocity",
    params: {
      member_id: 1,
      ixb: {
        exploration_depth: "deep",
        explain_click_rate: "high",
        interaction_velocity: "fast",
        hesitation_detected: false,
        anxiety_signal: "low",
      },
    },
  },
];

interface Props {
  selected: string;
  onSelect: (scenario: ScenarioPreset) => void;
  loading: boolean;
}

export function ScenarioSelector({ selected, onSelect, loading }: Props) {
  return (
    <div className="w-full lg:w-60 lg:shrink-0">
      {/* Mobile: horizontal scrollable chip strip */}
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {SCENARIOS.map((scenario) => {
          const isActive = selected === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => !loading && onSelect(scenario)}
              disabled={loading}
              className={cn(
                "flex-none rounded-full border px-4 py-2 text-xs font-medium transition-all whitespace-nowrap",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "border-neutral-400 dark:border-white/30 bg-white/10 dark:text-white text-neutral-800 font-semibold"
                  : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:text-neutral-200",
              )}
            >
              {scenario.label}
            </button>
          );
        })}
      </div>

      {/* Desktop: vertical card list */}
      <div className="hidden lg:block space-y-3">
        <div className="flex items-center gap-1.5">
          <Beaker className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
            Scenarios
          </span>
        </div>

        <div className="space-y-1.5">
          {SCENARIOS.map((scenario) => {
            const isActive = selected === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => !loading && onSelect(scenario)}
                disabled={loading}
                className={cn(
                  "w-full text-left rounded-xl border p-3 transition-all",
                  "hover:border-neutral-400 dark:hover:border-white/20 hover:bg-neutral-100 dark:hover:bg-white/5",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isActive
                    ? "border-neutral-800/30 bg-neutral-900/8 dark:border-white/25 dark:bg-white/5"
                    : "border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-900/60",
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isActive
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-700 dark:text-neutral-300",
                    )}
                  >
                    {scenario.label}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5",
                      isActive ? "border-neutral-400 dark:border-white/30 text-neutral-700 dark:text-white" : "",
                    )}
                  >
                    {scenario.id}
                  </Badge>
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  {scenario.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
