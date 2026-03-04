"use client";

import { useRef } from "react";
import { ExperienceConfig, ScreenPayload, SlotType } from "@/types/ix";
import { InsuranceMomentHeader } from "@/components/elements/InsuranceMomentHeader";
import { PolicySummaryCard } from "@/components/elements/PolicySummaryCard";
import { CoverageSpotlight } from "@/components/elements/CoverageSpotlight";
import { CoverageDetailsTable } from "@/components/elements/CoverageDetailsTable";
import { CostSimulator } from "@/components/elements/CostSimulator";
import { PreApprovalRequest } from "@/components/elements/PreApprovalRequest";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ELEMENT_RENDERERS: Record<string, React.ComponentType<{ config: ExperienceConfig; index: number; onPreApprovalCTA?: () => void; highlighted?: boolean }>> = {
  CL_INSURANCE_MOMENT_HEADER_V1: InsuranceMomentHeader,
  CL_POLICY_SUMMARY_CARD_V1: PolicySummaryCard,
  CL_COVERAGE_SPOTLIGHT_V1: CoverageSpotlight,
  DT_COVERAGE_DETAILS_TABLE_V1: CoverageDetailsTable,
  CA_COST_SIMULATOR_V1: CostSimulator,
  CA_PRE_APPROVAL_REQUEST_V1: PreApprovalRequest,
};

const SLOT_LABELS: Record<SlotType, { label: string; color: string }> = {
  anchor:     { label: "Anchor",     color: "dark:text-white dark:border-white/20 dark:bg-white/5 text-neutral-800 border-neutral-300 bg-neutral-100" },
  supporting: { label: "Supporting", color: "text-neutral-400 dark:border-neutral-600/50 border-neutral-300 dark:bg-neutral-800/50 bg-neutral-100/70" },
  actions:    { label: "Actions",    color: "text-neutral-300 dark:border-neutral-500/30 border-neutral-300 dark:bg-neutral-700/20 bg-neutral-100/50" },
};

interface Props {
  payload: ScreenPayload;
}

export function ScreenComposer({ payload }: Props) {
  const preApprovalRef = useRef<HTMLDivElement>(null);

  function scrollToPreApproval() {
    preApprovalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Group elements by slot for visual slot labels
  const slots: SlotType[] = ["anchor", "supporting", "actions"];
  const bySlot = slots.reduce<Record<SlotType, ExperienceConfig[]>>(
    (acc, s) => ({ ...acc, [s]: payload.elements.filter((e) => e.slot === s) }),
    { anchor: [], supporting: [], actions: [] }
  );

  let globalIndex = 0;

  return (
    <div className="space-y-6 flex-1 min-w-0">
      {slots.map((slot) => {
        const elems = bySlot[slot];
        if (!elems.length) return null;
        const slotMeta = SLOT_LABELS[slot];

        return (
          <div key={slot}>
            {/* Slot label */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  slotMeta.color
                )}
              >
                {slotMeta.label}
              </span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>

            {/* Elements in this slot */}
            <div
              className={cn(
                "space-y-3",
                slot === "supporting" && elems.length > 1 ? "md:grid md:grid-cols-2 md:gap-3 md:space-y-0" : ""
              )}
            >
              {elems.map((ec) => {
                const Renderer = ELEMENT_RENDERERS[ec.element_id];
                const idx = globalIndex++;
                if (!Renderer) {
                  return (
                    <div key={ec.element_id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-xs text-neutral-500">
                      Unknown element: {ec.element_id}
                    </div>
                  );
                }

                const isPreApproval = ec.element_id === "CA_PRE_APPROVAL_REQUEST_V1";

                return (
                  <div key={ec.element_id} ref={isPreApproval ? preApprovalRef : undefined}>
                    <Renderer
                      config={ec}
                      index={idx}
                      onPreApprovalCTA={ec.element_id === "CA_COST_SIMULATOR_V1" ? scrollToPreApproval : undefined}
                      highlighted={isPreApproval}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
