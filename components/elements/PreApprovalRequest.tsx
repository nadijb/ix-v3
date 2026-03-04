"use client";

import { useState } from "react";
import { FilePlus2, CheckCircle2, Loader2, AlertCircle, ChevronRight, Edit3, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ExperienceConfig, PreApprovalBinding, PreApprovalResult } from "@/types/ix";
import { formatSAR, cn } from "@/lib/utils";

interface Props {
  config: ExperienceConfig;
  index: number;
  highlighted?: boolean;
}

type Step = "fill" | "review" | "done";

export function PreApprovalRequest({ config, index, highlighted }: Props) {
  const b = config.data_binding as PreApprovalBinding;

  const [step, setStep]     = useState<Step>("fill");
  const [reason, setReason] = useState(
    b.procedure_type
      ? b.procedure_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : ""
  );
  const [amount, setAmount]   = useState<string>(b.estimated_amount ? String(b.estimated_amount) : "");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<PreApprovalResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const num                    = parseFloat(amount);
  const overThreshold          = !isNaN(num) && num > b.pre_approval_limit;
  const estimatedDays          = overThreshold ? "1–2 business days" : "Instant";
  const remainingChars         = 200 - reason.length;

  function goReview() {
    if (!reason.trim()) { setError("Please describe the procedure."); return; }
    if (isNaN(num) || num <= 0) { setError("Enter a valid amount."); return; }
    setError(null);
    setStep("review");
  }

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/pre-approval/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy_id: b.policy_id, reason: reason.trim(), estimated_amount: num }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Submission failed");
      setResult(data);
      setStep("done");
    } catch (e) {
      setError(String(e));
      setStep("fill");
    } finally {
      setLoading(false);
    }
  }

  // ── Step indicator ─────────────────────────────────────────────────────────
  const steps = [
    { key: "fill",   label: "Details"  },
    { key: "review", label: "Review"   },
    { key: "done",   label: "Submitted" },
  ];
  const stepIdx = steps.findIndex((s) => s.key === step);

  // ── Done state ─────────────────────────────────────────────────────────────
  if (step === "done" && result?.success) {
    return (
      <Card
        className={cn("border-emerald-500/30 bg-emerald-950/20 animate-fade-in-up opacity-0")}
        style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-emerald-300">Request Submitted</p>
              <p className="text-xs text-neutral-400 mt-1">
                Request #{result.request_id} · {result.status}
              </p>
            </div>
            <p className="text-sm text-neutral-300 bg-neutral-800/60 rounded-lg p-3 border border-neutral-700/50">
              {result.guidance_message}
            </p>
            <div className="flex gap-4 text-xs text-neutral-500">
              <span>Amount: <span className="text-neutral-300 font-medium">{formatSAR(result.estimated_amount)}</span></span>
              <span>Currency: <span className="text-neutral-300 font-medium">{result.currency}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn("animate-fade-in-up opacity-0", highlighted && "border-white/15 bg-white/5")}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 border border-white/10">
              <FilePlus2 className="h-4 w-4 text-neutral-300" />
            </div>
            <CardTitle className="text-sm">Pre-Approval Request</CardTitle>
          </div>
          {b.is_prefilled && <Badge variant="default" className="text-[10px]">Pre-filled</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-0">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full border transition-all",
                    i < stepIdx  && "dark:border-white dark:bg-white border-neutral-700 bg-neutral-700",
                    i === stepIdx && "dark:border-white dark:bg-neutral-900 dark:ring-white/20 border-neutral-600 bg-white ring-2 ring-neutral-300",
                    i > stepIdx  && "dark:border-neutral-600 dark:bg-neutral-800 border-neutral-300 bg-neutral-100"
                  )}
                />
                <span className={cn(
                  "text-[9px] mt-1",
                  i === stepIdx ? "dark:text-white text-neutral-900 font-medium" : i < stepIdx ? "text-neutral-400" : "text-neutral-600"
                )}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn("flex-1 h-px mb-3", i < stepIdx ? "dark:bg-white bg-neutral-700" : "dark:bg-neutral-700 bg-neutral-300")} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step: fill ─────────────────────────────────────────────────── */}
        {step === "fill" && (
          <>
            {/* Policy info */}
            <div className="grid grid-cols-2 gap-3 text-xs rounded-lg bg-neutral-800/40 border border-neutral-700/50 p-3">
              <div>
                <span className="text-neutral-500">Policy</span>
                <p className="text-neutral-200 font-medium mt-0.5">#{b.policy_id}</p>
              </div>
              <div>
                <span className="text-neutral-500">Member</span>
                <p className="text-neutral-200 font-medium mt-0.5">{b.member_name}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs">Procedure / Reason</Label>
                  <span className={cn("text-[10px]", remainingChars < 20 ? "text-amber-400" : "text-neutral-600")}>
                    {remainingChars} chars left
                  </span>
                </div>
                <Textarea
                  placeholder="Describe the procedure..."
                  value={reason}
                  maxLength={200}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[72px]"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Estimated Amount (SAR)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 4500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-mono"
                />
                {/* Processing estimate */}
                {amount && !isNaN(num) && num > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Clock className="h-3 w-3 text-neutral-500" />
                    <p className="text-[10px] text-neutral-500">
                      Estimated processing:{" "}
                      <span className={cn("font-medium", overThreshold ? "text-amber-400" : "text-emerald-400")}>
                        {estimatedDays}
                      </span>
                      {overThreshold && " (amount exceeds auto-approval threshold)"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <Button onClick={goReview} className="w-full" variant="default">
              Review Request
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}

        {/* ── Step: review ───────────────────────────────────────────────── */}
        {step === "review" && (
          <>
            <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/40 p-4 space-y-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Review your request</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Member</span>
                  <span className="text-neutral-200 font-medium">{b.member_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Policy</span>
                  <span className="text-neutral-200 font-mono">#{b.policy_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Amount</span>
                  <span className="text-amber-300 font-bold">{formatSAR(num)}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-neutral-400 shrink-0">Reason</span>
                  <span className="text-neutral-200 text-right text-xs leading-relaxed">{reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Processing</span>
                  <span className={cn("font-medium text-xs", overThreshold ? "text-amber-400" : "text-emerald-400")}>
                    {estimatedDays}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("fill")}
                disabled={loading}
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button onClick={submit} disabled={loading} className="flex-1">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</>
                ) : (
                  <>Confirm &amp; Submit</>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
