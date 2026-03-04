"use client";

import { useState } from "react";
import { Shield, ChevronDown, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CoInsuranceRulesBinding, CoInsuranceRule } from "@/types/ix";
import { formatSAR, cn } from "@/lib/utils";

interface Props {
  binding: CoInsuranceRulesBinding;
}

const RULE_EXPLANATIONS: Record<string, string> = {
  Hospital:    "Inpatient hospital stays, surgeries, and overnight care are fully covered — you pay nothing out-of-pocket.",
  Polyclinic:  "GP visits, specialist consultations, and outpatient procedures at network polyclinics are fully covered.",
  "Generic Medicine":
    "Generic drugs at approved pharmacies are partially covered. You pay the co-insurance percentage, up to the annual cap.",
  "Innovative Medicine":
    "Brand-name and specialty medications are partially covered. Your share is capped annually so costs stay predictable.",
};

function RuleRow({ rule, defaultOpen = false }: { rule: CoInsuranceRule; defaultOpen?: boolean }) {
  const [open, setOpen]           = useState(defaultOpen);
  const [medCost, setMedCost]     = useState("");
  const hasCalc = rule.coinsurance_pct > 0;

  const medNum      = parseFloat(medCost);
  const rawShare    = !isNaN(medNum) && medNum > 0 ? (medNum * rule.coinsurance_pct) / 100 : null;
  const yourShare   = rawShare !== null && rule.annual_cap_sar != null
    ? Math.min(rawShare, rule.annual_cap_sar)
    : rawShare;
  const insShare    = rawShare !== null ? medNum - (yourShare ?? rawShare) : null;

  const explanation = RULE_EXPLANATIONS[rule.category] ?? "Coverage applies as defined by your policy terms.";

  return (
    <div className={cn("border-b border-neutral-800 last:border-0 transition-colors", open && "bg-neutral-800/20")}>
      {/* Clickable row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid grid-cols-3 items-center w-full px-4 py-3 text-left hover:bg-white/3 transition-colors"
      >
        <span className="text-sm font-medium text-neutral-200">{rule.category}</span>
        <span className="text-xs text-neutral-400">{rule.type}</span>
        <div className="flex items-center justify-end gap-2">
          {rule.coinsurance_pct === 0 ? (
            <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              NIL
            </Badge>
          ) : (
            <>
              <Badge className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                {rule.coinsurance_pct}%
              </Badge>
              {rule.annual_cap_sar != null && (
                <span className="text-[10px] text-neutral-500 tabular-nums">≤ SAR {rule.annual_cap_sar}</span>
              )}
            </>
          )}
          <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-600 transition-transform duration-200 shrink-0", open && "rotate-180")} />
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-150 px-4 pb-4 space-y-3">
          {/* Explanation */}
          <p className="text-xs text-neutral-400 leading-relaxed border-l-2 border-neutral-700 pl-3">
            {explanation}
          </p>

          {/* Mini calculator — only for rules with co-insurance */}
          {hasCalc && (
            <div className="rounded-lg border border-neutral-700/50 bg-neutral-900/60 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 uppercase tracking-wider">
                <Calculator className="h-3 w-3" />
                Cost calculator
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Medicine cost (SAR)"
                  value={medCost}
                  onChange={(e) => setMedCost(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              {yourShare !== null && insShare !== null && (
                <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-150">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
                    <p className="text-[9px] text-emerald-500 mb-0.5">Insurance pays</p>
                    <p className="text-sm font-bold text-emerald-300 tabular-nums">{formatSAR(insShare)}</p>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-center">
                    <p className="text-[9px] text-amber-500 mb-0.5">You pay</p>
                    <p className="text-sm font-bold text-amber-300 tabular-nums">{formatSAR(yourShare)}</p>
                    {rule.annual_cap_sar != null && rawShare! > rule.annual_cap_sar && (
                      <p className="text-[8px] text-amber-600 mt-0.5">cap applied</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CoInsuranceRules({ binding }: Props) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700/50">
              <Shield className="h-4 w-4 text-neutral-300" />
            </div>
            <div>
              <CardTitle className="text-sm">{binding.title}</CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">{binding.subtitle}</p>
            </div>
          </div>
          <span className="text-[10px] text-neutral-600">tap row for details</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="rounded-xl overflow-hidden border border-neutral-800">
          {/* Column headers */}
          <div className="grid grid-cols-3 bg-neutral-800/60 px-4 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Category</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Type</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 text-right">Your Share</span>
          </div>

          {binding.rules.map((rule, i) => (
            <RuleRow key={i} rule={rule} />
          ))}
        </div>

        <p className="text-[10px] text-neutral-600 mt-3 leading-relaxed">
          Co-insurance applies after deductibles. Annual caps reset at policy renewal.
        </p>
      </CardContent>
    </Card>
  );
}
