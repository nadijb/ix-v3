"use client";

import { useState } from "react";
import { User, FileText, CheckCircle2, AlertCircle, Copy, Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExperienceConfig, PolicySummaryBinding } from "@/types/ix";
import { formatSAR, cn } from "@/lib/utils";

interface Props {
  config: ExperienceConfig;
  index: number;
}

export function PolicySummaryCard({ config, index }: Props) {
  const b = config.data_binding as PolicySummaryBinding;
  const isActive = b.policy_status === "active";

  const [copied, setCopied]           = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  function copyPolicy() {
    navigator.clipboard.writeText(b.policy_number).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card
      className={cn("animate-fade-in-up opacity-0")}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
            Policy
          </CardTitle>
          <Badge variant={isActive ? "active" : "warning"} className="gap-1">
            {isActive ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {b.policy_status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Member row */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700">
            <User className="h-4 w-4 text-neutral-400" />
          </div>
          <div>
            <p className="font-semibold text-neutral-100">{b.member_name}</p>
            <p className="text-xs text-neutral-500 font-mono">{b.national_id_masked}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          {/* Copyable policy number */}
          <div>
            <p className="text-xs text-neutral-500 mb-1">Policy Number</p>
            <button
              onClick={copyPolicy}
              title="Tap to copy"
              className="group flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -mx-1.5 hover:bg-neutral-800 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              <span className="text-sm font-mono text-neutral-200">{b.policy_number}</span>
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="h-3 w-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </button>
            {copied && (
              <p className="text-[10px] text-emerald-400 mt-0.5 animate-in fade-in duration-150">
                Copied!
              </p>
            )}
          </div>

          {/* Pre-approval limit */}
          <div>
            <p className="text-xs text-neutral-500 mb-1">Pre-approval Limit</p>
            <p className="text-sm font-semibold text-amber-300">{formatSAR(b.pre_approval_limit)}</p>
            <p className="text-[10px] text-neutral-600 mt-0.5">auto-approved below this</p>
          </div>
        </div>

        {/* Expand details */}
        <button
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-neutral-700/50 bg-neutral-800/30 px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors"
        >
          <span>More policy details</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", detailsOpen && "rotate-180")} />
        </button>

        {detailsOpen && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-neutral-700/50 bg-neutral-800/40 p-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-neutral-500 mb-0.5">Policy ID</p>
                <p className="text-neutral-300 font-mono">#{b.policy_id}</p>
              </div>
              <div>
                <p className="text-neutral-500 mb-0.5">Currency</p>
                <p className="text-neutral-300">{b.currency ?? "SAR"}</p>
              </div>
              <div>
                <p className="text-neutral-500 mb-0.5">Cover type</p>
                <p className="text-neutral-300">Comprehensive</p>
              </div>
              <div>
                <p className="text-neutral-500 mb-0.5">Network</p>
                <p className="text-neutral-300">In-network only</p>
              </div>
            </div>
            <p className="text-[10px] text-neutral-600 mt-3 pt-2 border-t border-neutral-700/50">
              For full policy documents contact your HR or insurance provider.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
