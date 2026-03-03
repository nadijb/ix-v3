"use client";

import { Brain, Eye, Zap, LayoutGrid, Hash, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IXPSnapshot, PersonaType } from "@/types/ix";
import { cn } from "@/lib/utils";

interface Props {
  ixp: IXPSnapshot;
  inputHash: string;
  ixpHash: string;
  audit: {
    elements_considered: number;
    elements_filtered: number;
    elements_emitted: number;
    determinism_check: string;
  };
}

const PERSONA_CONFIG: Record<PersonaType, { label: string; color: string; desc: string }> = {
  overwhelmed: {
    label: "Overwhelmed",
    color: "text-neutral-200 bg-white/5 border-white/15",
    desc: "High anxiety, needs guidance",
  },
  data_driven: {
    label: "Data-Driven",
    color: "text-neutral-200 bg-white/5 border-white/15",
    desc: "Deep explorer, reads details",
  },
  cautious: {
    label: "Cautious",
    color: "text-neutral-300 bg-neutral-800/50 border-neutral-600",
    desc: "Hesitant, prefers certainty",
  },
  proactive: {
    label: "Proactive",
    color: "text-neutral-200 bg-white/5 border-white/15",
    desc: "Overrides defaults, decisive",
  },
  minimalist: {
    label: "Minimalist",
    color: "text-neutral-200 bg-white/5 border-white/15",
    desc: "Shallow explorer, skims",
  },
  standard: {
    label: "Standard",
    color: "text-neutral-300 bg-neutral-800/50 border-neutral-600",
    desc: "Balanced interaction pattern",
  },
};

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-xs text-neutral-500 shrink-0">{label}</span>
      <span className={cn("text-xs text-neutral-300 text-right", mono && "font-mono")}>{value}</span>
    </div>
  );
}

export function IXPPanel({ ixp, inputHash, ixpHash, audit }: Props) {
  const [expanded, setExpanded] = useState(true);
  const persona = ixp.user_profile.persona_type;
  const personaCfg = PERSONA_CONFIG[persona] ?? PERSONA_CONFIG.standard;

  return (
    <div className="w-72 shrink-0 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">IX Profile</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 animate-fade-in-up">
          {/* Persona card */}
          <div className={cn("rounded-xl border p-3", personaCfg.color)}>
            <div className="flex items-start justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wider opacity-70">Detected persona</span>
              <Brain className="h-3.5 w-3.5 opacity-50" />
            </div>
            <p className="text-sm font-semibold">{personaCfg.label}</p>
            <p className="text-[11px] opacity-70 mt-0.5">{personaCfg.desc}</p>
          </div>

          {/* User profile */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Eye className="h-3 w-3 text-neutral-500" />
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">User Profile</span>
            </div>
            <div className="divide-y divide-neutral-800">
              <Row label="Literacy" value={ixp.user_profile.health_literacy_level} />
              <Row label="Risk posture" value={ixp.user_profile.risk_posture} />
              <Row label="Trust" value={ixp.user_profile.trust_level} />
            </div>
          </div>

          {/* Presentation */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <LayoutGrid className="h-3 w-3 text-neutral-500" />
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Presentation</span>
            </div>
            <div className="divide-y divide-neutral-800">
              <Row label="Density" value={ixp.presentation.density_preference} />
              <Row label="Ordering" value={ixp.presentation.content_ordering} />
              <Row label="Representation" value={ixp.presentation.default_representation} />
              <Row label="Layout" value={ixp.presentation.layout_appetite} />
            </div>
          </div>

          {/* Guidance */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="h-3 w-3 text-neutral-500" />
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Guidance Style</span>
            </div>
            <div className="divide-y divide-neutral-800">
              <Row label="Level" value={ixp.guidance_style.guidance_level} />
              <Row label="Tone" value={ixp.guidance_style.authority_tone} />
              <Row label="Motivation" value={ixp.guidance_style.motivational_style} />
              <Row
                label="No alarmist"
                value={ixp.guidance_style.avoid_alarmist_language ? "Yes" : "No"}
              />
            </div>
          </div>

          {/* Interaction blueprint */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="divide-y divide-neutral-800">
              <Row label="Element mode" value={ixp.interaction_blueprint.default_element_mode} />
              <Row
                label="Stepwise flows"
                value={ixp.interaction_blueprint.prefers_stepwise_flows ? "Yes" : "No"}
              />
            </div>
          </div>

          {/* Hashes */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Hash className="h-3 w-3 text-neutral-500" />
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">Determinism</span>
            </div>
            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] text-neutral-600 mb-0.5">input_hash</p>
                <code className="text-[10px] text-neutral-400 font-mono">{inputHash}</code>
              </div>
              <div>
                <p className="text-[10px] text-neutral-600 mb-0.5">ixp_hash</p>
                <code className="text-[10px] text-neutral-400 font-mono">{ixpHash}</code>
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-800" />

          {/* Audit */}
          <div className="flex gap-2 text-center">
            {[
              { label: "Considered", value: audit.elements_considered },
              { label: "Filtered", value: audit.elements_filtered },
              { label: "Emitted", value: audit.elements_emitted },
            ].map((item) => (
              <div key={item.label} className="flex-1 rounded-lg bg-neutral-800/60 border border-neutral-700/50 py-2">
                <p className="text-lg font-bold text-neutral-200">{item.value}</p>
                <p className="text-[10px] text-neutral-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
