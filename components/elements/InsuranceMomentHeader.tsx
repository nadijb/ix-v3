"use client";

import { Shield, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExperienceConfig, HeaderBinding } from "@/types/ix";
import { cn } from "@/lib/utils";

interface Props {
  config: ExperienceConfig;
  index: number;
}

export function InsuranceMomentHeader({ config, index }: Props) {
  const b = config.data_binding as HeaderBinding;

  return (
    <Card
      className={cn(
        "border-neutral-700/50 bg-neutral-900",
        "animate-fade-in-up opacity-0"
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
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
            <button className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors shrink-0">
              <span className="font-mono">{b.policy_chip.label}</span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  b.policy_chip.status === "active" ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              <ChevronRight className="h-3 w-3 text-neutral-500" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
