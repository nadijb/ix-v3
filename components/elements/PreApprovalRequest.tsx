"use client";

import { useState } from "react";
import { FilePlus2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
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

export function PreApprovalRequest({ config, index, highlighted }: Props) {
  const b = config.data_binding as PreApprovalBinding;

  const [reason, setReason] = useState(
    b.procedure_type
      ? b.procedure_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : ""
  );
  const [amount, setAmount] = useState<string>(b.estimated_amount ? String(b.estimated_amount) : "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreApprovalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const num = parseFloat(amount);
    if (!reason.trim()) { setError("Reason is required."); return; }
    if (isNaN(num) || num <= 0) { setError("Enter a valid amount."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/pre-approval/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policy_id: b.policy_id,
          reason: reason.trim(),
          estimated_amount: num,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Submission failed");
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  if (result?.success) {
    return (
      <Card
        className={cn(
          "border-emerald-500/30 bg-emerald-950/20 animate-fade-in-up opacity-0"
        )}
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
      className={cn(
        "animate-fade-in-up opacity-0",
        highlighted ? "border-white/15 bg-white/5" : ""
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 border border-white/10">
              <FilePlus2 className="h-4 w-4 text-neutral-300" />
            </div>
            <div>
              <CardTitle className="text-sm">Pre-Approval Request</CardTitle>
            </div>
          </div>
          {b.is_prefilled && (
            <Badge variant="default" className="text-[10px]">Pre-filled</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs text-neutral-400 rounded-lg bg-neutral-800/40 border border-neutral-700/50 p-3">
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
            <Label className="text-xs mb-1.5 block">Procedure / Reason</Label>
            <Textarea
              placeholder="Describe the procedure..."
              value={reason}
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
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        <Button
          onClick={submit}
          disabled={loading}
          className="w-full"
          variant="default"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting…
            </>
          ) : (
            "Submit Pre-Approval Request"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
