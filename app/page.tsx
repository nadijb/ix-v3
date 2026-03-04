"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { RefreshCw, Loader2, AlertCircle, Cpu, GitBranch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScenarioSelector, SCENARIOS } from "@/components/ScenarioSelector";
import { ScreenComposer } from "@/components/ScreenComposer";
import { IXPPanel } from "@/components/IXPPanel";
import { ChatWidget } from "@/components/ChatWidget";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CoInsuranceRules } from "@/components/elements/CoInsuranceRules";
import { ProviderFinder } from "@/components/elements/ProviderFinder";
import { ClaimsTracker } from "@/components/elements/ClaimsTracker";
import {
  ScreenPayload,
  ScenarioPreset,
  ChatElement,
  CoInsuranceRulesBinding,
  ProviderFinderBinding,
  ClaimsTrackerBinding,
} from "@/types/ix";
import { cn } from "@/lib/utils";

const PERSONA_COLORS: Record<string, string> = {
  overwhelmed: "text-neutral-200",
  data_driven: "text-white",
  cautious: "text-neutral-300",
  proactive: "text-neutral-200",
  minimalist: "text-neutral-300",
  standard: "text-neutral-300",
};

// Render an AI-returned element by element_id
function AIElementRenderer({ entry }: { entry: { element: ChatElement; version: number } }) {
  const { element } = entry;
  switch (element.element_id) {
    case "CL_COINSURANCE_RULES_V1":
      return <CoInsuranceRules binding={element.data_binding as CoInsuranceRulesBinding} />;
    case "DT_PROVIDER_FINDER_V1":
      return <ProviderFinder binding={element.data_binding as ProviderFinderBinding} />;
    case "CL_CLAIMS_TRACKER_V1":
      return <ClaimsTracker binding={element.data_binding as ClaimsTrackerBinding} />;
    default:
      return null;
  }
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<ScreenPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>("1.1");
  const [aiElements, setAiElements] = useState<
    Array<{ element: ChatElement; version: number }>
  >([]);
  const scrollTargetRef = useRef<string | null>(null);

  const handleNewElement = useCallback((element: ChatElement) => {
    scrollTargetRef.current = element.element_id;
    setAiElements((prev) => {
      const idx = prev.findIndex((e) => e.element.element_id === element.element_id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { element, version: prev[idx].version + 1 };
        return next;
      }
      return [...prev, { element, version: 0 }];
    });
  }, []);

  // Smooth-scroll to newly added/updated AI element after render
  useEffect(() => {
    if (!scrollTargetRef.current) return;
    const id = scrollTargetRef.current;
    scrollTargetRef.current = null;
    // Small delay lets the element animate in before scrolling
    const timer = setTimeout(() => {
      document.querySelector(`[data-ai-element="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(timer);
  }, [aiElements]);

  const compose = useCallback(async (scenario: ScenarioPreset) => {
    setLoading(true);
    setError(null);
    setPayload(null);
    setSelectedScenario(scenario.id);
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario.params),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`);
      }
      setPayload(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const currentScenario = SCENARIOS.find((s) => s.id === selectedScenario);
  const persona = payload?.ixp_snapshot.user_profile.persona_type;

  // Auto-run baseline on mount
  useEffect(() => {
    const baseline = SCENARIOS.find((s) => s.id === "1.1");
    if (baseline) compose(baseline);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col">
      <ThemeToggle />
      {/* Top bar */}
      <header className="hidden sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 h-14">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 select-none">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-white blur-md opacity-10" />
                <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black text-xs font-black">
                  IX
                </div>
              </div>
              <span className="text-sm font-bold text-neutral-100">
                Intelligence
                <span className="text-white font-black">X</span>
              </span>
            </div>
            <div className="h-4 w-px bg-neutral-800" />
            <span className="text-xs text-neutral-500">
              Experience Composition Engine
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            {payload && (
              <>
                {persona && (
                  <div className="flex items-center gap-1.5 rounded-full border border-neutral-700/50 bg-neutral-900/80 px-3 py-1">
                    <Cpu className="h-3 w-3 text-neutral-500" />
                    <span className="text-xs text-neutral-500">Persona:</span>
                    <span
                      className={cn(
                        "text-xs font-semibold capitalize",
                        PERSONA_COLORS[persona] ?? "text-neutral-300",
                      )}
                    >
                      {persona.replace("_", " ")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 rounded-full border border-neutral-700/50 bg-neutral-900/80 px-3 py-1">
                  <GitBranch className="h-3 w-3 text-neutral-500" />
                  <span className="text-xs text-neutral-500">
                    {payload.elements.length} elements
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                  <span className="text-xs text-emerald-400/70">Live</span>
                </div>
              </>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => currentScenario && compose(currentScenario)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Recompose
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-6 p-4 lg:p-6 pb-28 lg:pb-28">
        {/* Scenarios: chip strip on mobile, sidebar on desktop */}
        <ScenarioSelector
          selected={selectedScenario}
          onSelect={compose}
          loading={loading}
        />

        {/* Center: Screen */}
        <div className="flex-1 min-w-0">
          {loading && (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-white/10 blur-xl animate-pulse" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-neutral-900">
                  <Loader2 className="h-5 w-5 text-neutral-300 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-neutral-300 text-sm font-medium">
                  Composing…
                </p>
                {/*<p className="text-xs text-neutral-500 mt-1">
                  IXP derivation → element selection → variant scoring
                </p>*/}
              </div>
              {/*<div className="flex gap-1.5">
                {["Ingestion", "IXP", "Elements", "Variants", "Payload"].map((step, i) => (
                  <Badge key={step} variant="outline" className="text-[10px] animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                    {step}
                  </Badge>
                ))}
              </div>*/}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-300">
                    Composition failed
                  </p>
                  <p className="text-xs text-red-400/70 mt-1 font-mono">
                    {error}
                  </p>
                  <p className="text-xs text-neutral-500 mt-3">
                    Make sure your n8n instance is running and workflows are
                    active. Check{" "}
                    <code className="text-neutral-400">.env.local</code> →{" "}
                    <code className="text-neutral-400">N8N_BASE_URL</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {payload && !loading && (
            <div className="space-y-4">
              {/* Screen meta */}
              <div className="flex items-center justify-between">
                <span className="hidden sm:block text-xs text-neutral-600 font-mono">
                  {payload.pipeline_version} ·{" "}
                  {new Date(payload.generated_at).toLocaleTimeString()}
                </span>
              </div>

              <ScreenComposer payload={payload} />

              {/* AI-suggested elements — appended by chat, never cleared */}
              {aiElements.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-neutral-600" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
                      AI Suggested
                    </span>
                    <div className="flex-1 h-px bg-neutral-800" />
                  </div>
                  {aiElements.map((entry) => (
                    <div
                      key={`${entry.element.element_id}_${entry.version}`}
                      data-ai-element={entry.element.element_id}
                    >
                      <AIElementRenderer entry={entry} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: IXP panel — hidden in demo mode */}
        {payload && (
          <div className="hidden">
            <IXPPanel
              ixp={payload.ixp_snapshot}
              inputHash={payload.input_hash}
              ixpHash={payload.ixp_hash}
              audit={payload.audit}
            />
          </div>
        )}
      </div>

      {/* Sticky AI chat widget */}
      <ChatWidget onNewElement={handleNewElement} customerId={1} />
    </div>
  );
}
