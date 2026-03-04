"use client";

import { useState, useRef } from "react";
import { FileText, Clock, AlertCircle, Upload, CheckCircle2, Loader2, ChevronDown, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClaimsTrackerBinding } from "@/types/ix";
import { formatSAR, cn } from "@/lib/utils";

interface Props {
  binding: ClaimsTrackerBinding;
}

const STATUS_STYLE: Record<string, string> = {
  submitted:         "text-blue-400   bg-blue-500/10   border-blue-500/20",
  under_review:      "text-amber-400  bg-amber-500/10  border-amber-500/20",
  approved:          "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  rejected:          "text-red-400    bg-red-500/10    border-red-500/20",
  pending_documents: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

type UploadState = "idle" | "uploading" | "done";

export function ClaimsTracker({ binding }: Props) {
  const statusStyle = STATUS_STYLE[binding.status] ?? STATUS_STYLE.under_review;

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [appealOpen, setAppealOpen]     = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState("uploading");
    setTimeout(() => {
      setUploadedFile(file.name);
      setUploadState("done");
    }, 1500);
  }

  function triggerUpload() {
    fileRef.current?.click();
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700/50">
            <FileText className="h-4 w-4 text-neutral-300" />
          </div>
          <div>
            <CardTitle className="text-sm">{binding.title}</CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5 font-mono">{binding.batch_id}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Status banner */}
        <div className={cn("flex items-center gap-2.5 rounded-xl border px-4 py-3", statusStyle)}>
          <Clock className="h-4 w-4 shrink-0" />
          <span className="text-sm font-semibold">{binding.status_label}</span>
          {binding.estimated_completion && (
            <span className="ml-auto text-xs opacity-70 tabular-nums">
              Est. {binding.estimated_completion}
            </span>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Procedure</p>
            <p className="text-sm text-neutral-200 capitalize">
              {binding.procedure_type.replace(/_/g, " ")}
            </p>
          </div>
          <div className="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Submitted</p>
            <p className="text-sm text-neutral-200 tabular-nums">{binding.submitted_at}</p>
          </div>
          <div className="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Amount Claimed</p>
            <p className="text-sm font-bold font-mono text-neutral-100">
              {formatSAR(binding.amount_claimed_sar)}
            </p>
          </div>
          <div className="rounded-xl bg-neutral-800/40 border border-neutral-800 p-3">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Amount Approved</p>
            <p className="text-sm font-bold font-mono text-neutral-100">
              {binding.amount_approved_sar != null ? formatSAR(binding.amount_approved_sar) : "—"}
            </p>
          </div>
        </div>

        {/* Timeline — steps are now clickable */}
        <div>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-3">Progress</p>
          <div className="flex items-start">
            {binding.timeline.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div className={cn("flex-1 h-px", binding.timeline[i - 1].completed ? "dark:bg-white bg-neutral-600" : "dark:bg-neutral-700 bg-neutral-300")} />
                  )}
                  <button
                    onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                    className={cn(
                      "h-3 w-3 rounded-full border-2 shrink-0 transition-all",
                      step.completed
                        ? "dark:border-white dark:bg-white dark:hover:ring-white/30 border-neutral-600 bg-neutral-600 hover:ring-2 hover:ring-neutral-300"
                        : "dark:border-neutral-600 dark:bg-neutral-800 border-neutral-300 bg-neutral-200"
                    )}
                  />
                  {i < binding.timeline.length - 1 && (
                    <div className={cn("flex-1 h-px", step.completed ? "dark:bg-white bg-neutral-600" : "dark:bg-neutral-700 bg-neutral-300")} />
                  )}
                </div>
                <span className={cn(
                  "text-[9px] mt-1.5 text-center leading-tight",
                  step.completed ? "text-neutral-300" : "text-neutral-600"
                )}>
                  {step.step}
                </span>
              </div>
            ))}
          </div>

          {/* Expanded step detail */}
          {expandedStep !== null && binding.timeline[expandedStep] && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-150 mt-3 rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-3 py-2.5 flex items-start gap-2">
              {binding.timeline[expandedStep].completed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-xs font-medium text-neutral-200">{binding.timeline[expandedStep].step}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  {binding.timeline[expandedStep].completed
                    ? "This step has been completed."
                    : "This step is pending. We'll notify you when there's an update."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Documents required CTA */}
        {binding.documents_required && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2.5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-amber-300">Documents Required</p>
                <p className="text-[10px] text-amber-400/70 mt-0.5">
                  Upload supporting documents to expedite your claim review.
                </p>
              </div>
            </div>

            {/* Upload area */}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleUpload}
            />

            {uploadState === "idle" && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                onClick={triggerUpload}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload Document
              </Button>
            )}

            {uploadState === "uploading" && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin shrink-0" />
                <span className="text-xs text-amber-300">Uploading…</span>
              </div>
            )}

            {uploadState === "done" && uploadedFile && (
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-200 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <Paperclip className="h-3 w-3 text-emerald-500 shrink-0" />
                <span className="text-xs text-emerald-300 truncate">{uploadedFile}</span>
                <span className="text-[10px] text-emerald-500 ml-auto shrink-0">Uploaded</span>
              </div>
            )}
          </div>
        )}

        {/* Appeal section */}
        {binding.appeal_eligible && (
          <div>
            <button
              onClick={() => setAppealOpen((v) => !v)}
              className="w-full flex items-center justify-between text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-1"
            >
              <span>Appeal this decision</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", appealOpen && "rotate-180")} />
            </button>

            {appealOpen && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-150 mt-2 rounded-xl border border-neutral-700/50 bg-neutral-800/40 p-3 space-y-2 text-xs">
                <p className="text-neutral-400 leading-relaxed">
                  You have the right to appeal this decision within <span className="text-neutral-200 font-medium">30 days</span> of the decision date.
                  Contact your insurance provider with:
                </p>
                <ul className="space-y-1 text-neutral-500">
                  <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-neutral-600 shrink-0" />Batch ID: <span className="font-mono text-neutral-300">{binding.batch_id}</span></li>
                  <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-neutral-600 shrink-0" />Supporting medical documentation</li>
                  <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-neutral-600 shrink-0" />Treating physician's statement</li>
                </ul>
                <p className="text-[10px] text-neutral-600 pt-1 border-t border-neutral-700/50">
                  For assistance, contact HR or your insurance relationship manager.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
