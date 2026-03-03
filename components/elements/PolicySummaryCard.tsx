"use client";

import { User, FileText, CheckCircle2, AlertCircle } from "lucide-react";
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
            {isActive ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {b.policy_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <div>
            <p className="text-xs text-neutral-500 mb-1">Policy Number</p>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-sm font-mono text-neutral-200">{b.policy_number}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Pre-approval Limit</p>
            <p className="text-sm font-semibold text-amber-300">
              {formatSAR(b.pre_approval_limit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
