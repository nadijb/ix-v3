"use client";

import { useState } from "react";
import { Shield, Clock, ChevronDown, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExperienceConfig, HeaderBinding } from "@/types/ix";
import { cn } from "@/lib/utils";

interface Props {
  config: ExperienceConfig;
  index: number;
}

const JOURNEY_STEPS = [
  { key: "procedure",   label: "Procedure",      desc: "Procedure completed" },
  { key: "coverage",    label: "Coverage Check",  desc: "Reviewing your benefits" },
  { key: "preapproval", label: "Pre-Approval",    desc: "Submit if required" },
  { key: "done",        label: "All Set",          desc: "You're covered" },
];

// We are always at step 1 (coverage check) in this insurance moment
const CURRENT_STEP = 1;

export function InsuranceMomentHeader({ config, index }: Props) {
  const b = config.data_binding as HeaderBinding;
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={cn("animate-fade-in-up opacity-0")}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <CardContent className="p-6">
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 border border-white/10">
              <Shield className="h-5 w-5 text-neutral-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="default" className="text-[10px] px-2 py-0">
                  {b.context_label ?? "Post-procedure"}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-2 py-0">
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  Same day
                </Badge>
              </div>
              <h1 className="text-lg font-semibold text-neutral-100">{b.title}</h1>
              <p className="text-sm text-neutral-400 mt-0.5">{b.subtitle}</p>
            </div>
          </div>

          {b.policy_chip && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors shrink-0"
            >
              <span className="font-mono">{b.policy_chip.label}</span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  b.policy_chip.status === "active" ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-neutral-500 transition-transform duration-200",
                  expanded && "rotate-180"
                )}
              />
            </button>
          )}
        </div>

        {/* Journey progress tracker */}
        <div className="flex items-start">
          {JOURNEY_STEPS.map((step, i) => {
            const done    = i < CURRENT_STEP;
            const current = i === CURRENT_STEP;
            const future  = i > CURRENT_STEP;
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div className={cn("flex-1 h-px", done ? "dark:bg-white bg-neutral-700" : "dark:bg-neutral-700 bg-neutral-300")} />
                  )}
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                      done    && "dark:border-white dark:bg-white border-neutral-700 bg-neutral-700",
                      current && "dark:border-white dark:bg-neutral-900 dark:ring-white/20 border-neutral-600 bg-white ring-2 ring-neutral-300",
                      future  && "dark:border-neutral-600 dark:bg-neutral-800 border-neutral-300 bg-neutral-100"
                    )}
                  >
                    {done    && <CheckCircle2 className="h-2.5 w-2.5 text-white dark:text-black" />}
                    {current && <span className="h-1.5 w-1.5 rounded-full dark:bg-white bg-neutral-700 animate-pulse" />}
                  </div>
                  {i < JOURNEY_STEPS.length - 1 && (
                    <div className={cn("flex-1 h-px", done && !current ? "dark:bg-white bg-neutral-700" : "dark:bg-neutral-700 bg-neutral-300")} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[9px] mt-1.5 text-center leading-tight",
                    done    && "text-neutral-300 font-medium",
                    current && "dark:text-white text-neutral-900 font-semibold",
                    future  && "text-neutral-600"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Expandable policy quick-info */}
        {expanded && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-neutral-700/50 bg-neutral-800/40 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-neutral-500 mb-0.5">Procedure</p>
                <p className="text-neutral-200 capitalize font-medium">
                  {b.procedure_type?.replace(/_/g, " ") ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 mb-0.5">Policy Status</p>
                <p className="text-emerald-400 font-semibold capitalize">
                  {b.policy_chip?.status ?? "active"}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 border-t border-neutral-700/50 pt-2">
              Scroll down to check coverage, simulate your costs, and submit a pre-approval request.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
