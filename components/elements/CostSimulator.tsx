"use client";

import { useState } from "react";
import { Calculator, ArrowRight, Loader2, TrendingUp, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExperienceConfig, CostSimulatorBinding, CostSimResult, PreviewResult } from "@/types/ix";
import { formatSAR, formatPct, cn } from "@/lib/utils";

interface Props {
  config: ExperienceConfig;
  index: number;
  onPreApprovalCTA?: () => void;
}

const QUICK_AMOUNTS = [500, 1000, 2500, 4500];

function CoverageResult({ result, currency }: { result: PreviewResult | CostSimResult; currency: string }) {
  const preApprovalRequired = "pre_approval_required" in result ? result.pre_approval_required : false;
  const insurancePays       = "insurance_pays"        in result ? result.insurance_pays        : 0;
  const personalShare       = "personal_share"        in result ? result.personal_share        : 0;
  const coveragePct         = "coverage_pct"          in result ? result.coverage_pct          : 0;
  const estimatedAmount     = "estimated_amount"      in result ? result.estimated_amount      : 0;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Coverage bar */}
      <div className="rounded-xl bg-neutral-800/60 border border-neutral-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-neutral-400 uppercase tracking-wider">Coverage breakdown</span>
          <Badge
            variant={coveragePct === 100 ? "success" : coveragePct > 50 ? "default" : "warning"}
            className="font-mono text-xs"
          >
            {formatPct(coveragePct)} covered
          </Badge>
        </div>

        <div className="h-3 rounded-full overflow-hidden bg-neutral-700 mb-3">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              coveragePct === 100 ? "bg-emerald-500" : coveragePct > 50 ? "bg-white" : "bg-amber-500"
            )}
            style={{ width: `${Math.max(coveragePct, 2)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
            <p className="text-xs text-emerald-400 mb-1">Insurance pays</p>
            <p className="text-lg font-bold text-emerald-300">{formatSAR(insurancePays)}</p>
          </div>
          <div className={cn(
            "rounded-lg border p-3 text-center",
            personalShare > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-neutral-800 border-neutral-700"
          )}>
            <p className={cn("text-xs mb-1", personalShare > 0 ? "text-amber-400" : "text-neutral-500")}>
              You pay
            </p>
            <p className={cn("text-lg font-bold", personalShare > 0 ? "text-amber-300" : "text-neutral-500")}>
              {personalShare > 0 ? formatSAR(personalShare) : "Nothing"}
            </p>
          </div>
        </div>
      </div>

      {/* What percentage of benefit this uses */}
      {"benefit_before" in result && result.benefit_before && (
        <div className="rounded-lg bg-neutral-800/40 border border-neutral-700/50 px-3 py-2 flex items-center justify-between text-xs text-neutral-400">
          <span>Benefit impact</span>
          <span className="font-mono text-neutral-300">
            {formatSAR(estimatedAmount)} of {formatSAR(result.benefit_before.remaining)} remaining
          </span>
        </div>
      )}

      {preApprovalRequired && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-300">Pre-approval required</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {formatSAR(estimatedAmount)} exceeds the automatic approval threshold.
            </p>
          </div>
        </div>
      )}

      {!preApprovalRequired && personalShare === 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-300">Your insurance covers this procedure in full.</p>
        </div>
      )}

      {"guidance_message" in result && result.guidance_message && (
        <p className="text-xs text-neutral-400 italic">{result.guidance_message}</p>
      )}
    </div>
  );
}

export function CostSimulator({ config, index, onPreApprovalCTA }: Props) {
  const b = config.data_binding as CostSimulatorBinding;
  const [amount, setAmount] = useState<string>(b.placeholder_amount ? String(b.placeholder_amount) : "");
  const [result, setResult] = useState<CostSimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function simulateWith(val: number) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/cost-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy_id: b.policy_id, cover_code: b.cover_code, estimated_amount: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Simulation failed");
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function simulate() {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) { setError("Enter a valid amount."); return; }
    simulateWith(num);
  }

  function pickQuick(val: number) {
    setAmount(String(val));
    simulateWith(val);
  }

  const activeResult = result ?? (b.preview_result ? b.preview_result : null);

  return (
    <Card
      className={cn("animate-fade-in-up opacity-0")}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 border border-white/10">
              <Calculator className="h-4 w-4 text-neutral-300" />
            </div>
            <CardTitle className="text-sm">Cost Simulator</CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <TrendingUp className="h-3 w-3" />
            <span>{formatSAR(b.remaining_benefit)} remaining</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick-amount chips */}
        <div>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" /> Quick amounts
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {QUICK_AMOUNTS.map((qa) => (
              <button
                key={qa}
                onClick={() => pickQuick(qa)}
                disabled={loading}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-mono transition-all",
                  amount === String(qa)
                    ? "dark:bg-white dark:text-black dark:border-white bg-neutral-900 text-white border-neutral-900"
                    : "border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                )}
              >
                {formatSAR(qa)}
              </button>
            ))}
          </div>
        </div>

        {/* Manual input */}
        <div>
          <Label className="text-xs mb-1.5 block">Or enter a custom amount (SAR)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="e.g. 4500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && simulate()}
              className="font-mono"
            />
            <Button onClick={simulate} disabled={loading} size="default" className="shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>

        {activeResult && (
          <CoverageResult result={activeResult} currency={b.currency} />
        )}

        {(result?.pre_approval_required || b.preview_result?.pre_approval_required) && onPreApprovalCTA && (
          <Button variant="success" className="w-full" onClick={onPreApprovalCTA}>
            Request Pre-Approval
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
