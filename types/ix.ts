// IX v3 — Core Type Definitions

export type PersonaType =
  | "overwhelmed"
  | "data_driven"
  | "cautious"
  | "proactive"
  | "minimalist"
  | "standard";

export type DensityPreference = "minimal" | "standard" | "dense";
export type GuidanceLevel = "directive" | "informative" | "advisory" | "minimal";
export type SlotType = "anchor" | "supporting" | "actions";

export interface IXPSnapshot {
  schema_version: string;
  user_profile: {
    persona_type: PersonaType;
    health_literacy_level: "low" | "medium" | "high";
    risk_posture: string;
    trust_level: string;
  };
  presentation: {
    density_preference: DensityPreference;
    content_ordering: "urgency_first" | "actions_first" | "insights_first" | "standard";
    default_representation: "visual" | "numeric" | "textual" | "mixed";
    layout_appetite: "compact" | "expanded";
  };
  guidance_style: {
    guidance_level: GuidanceLevel;
    authority_tone: "firm" | "moderate" | "gentle";
    avoid_alarmist_language: boolean;
    motivational_style: "reassuring" | "neutral" | "encouraging";
  };
  interaction_blueprint: {
    default_element_mode: "summary" | "details" | "action";
    prefers_stepwise_flows: boolean;
  };
}

// Data bindings per element type
export interface HeaderBinding {
  title: string;
  subtitle: string;
  context_label: string;
  procedure_type: string;
  policy_chip: { label: string; status: string; tap_target: string };
}

export interface PolicySummaryBinding {
  member_name: string;
  national_id_masked: string;
  policy_number: string;
  policy_status: string;
  pre_approval_limit: number;
  currency: string;
  policy_id: number;
}

export interface CoverageSpotlightBinding {
  cover_code: string;
  cover_name: string;
  is_covered: boolean;
  included_treatments: string[];
  requires_pre_approval: boolean;
  requires_network_provider: boolean;
  annual_limit: number;
  used_amount: number;
  remaining: number;
  currency: string;
}

export interface BenefitRow {
  cover_code: string;
  label: string;
  annual_limit: number;
  used: number;
  remaining: number;
  currency: string;
  is_highlighted: boolean;
}

export interface CoverageTableBinding {
  rows: BenefitRow[];
  tap_target_element: string;
}

export interface PreviewResult {
  estimated_amount: number;
  insurance_pays: number;
  personal_share: number;
  coverage_pct: number;
  pre_approval_required: boolean;
}

export interface CostSimulatorBinding {
  policy_id: number;
  cover_code: string;
  remaining_benefit: number;
  pre_approval_limit: number;
  currency: string;
  placeholder_amount: number | null;
  simulate_endpoint: string;
  preview_result: PreviewResult | null;
}

export interface PreApprovalBinding {
  policy_id: number;
  member_name: string;
  cover_code: string;
  procedure_type: string;
  estimated_amount: number | null;
  currency: string;
  is_prefilled: boolean;
  existing_approvals_count: number;
  submit_endpoint: string;
  pre_approval_limit: number;
}

export type AnyBinding =
  | HeaderBinding
  | PolicySummaryBinding
  | CoverageSpotlightBinding
  | CoverageTableBinding
  | CostSimulatorBinding
  | PreApprovalBinding
  | Record<string, unknown>;

export interface ExperienceConfig {
  element_id: string;
  variant_id: string;
  slot: SlotType;
  position: number;
  sizing: string;
  prominence: string;
  density: string;
  palette: string;
  interaction_modality: string;
  guidance_level: string;
  tone: string;
  content_scope: string;
  fitness_score?: number;
  data_binding: AnyBinding;
}

export interface ScreenPayload {
  payload_id: string;
  screen_id: string;
  intent_id: string;
  correlation_id: string;
  generated_at: string;
  pipeline_version: string;
  input_hash: string;
  ixp_hash: string;
  ixp_snapshot: IXPSnapshot;
  elements: ExperienceConfig[];
  audit: {
    steps_executed: string[];
    elements_considered: number;
    elements_filtered: number;
    elements_emitted: number;
    filter_reasons: string[];
    determinism_check: string;
  };
}

export interface CostSimResult {
  policy_id: number;
  cover_code: string;
  estimated_amount: number;
  insurance_pays: number;
  personal_share: number;
  coverage_pct: number;
  benefit_before: { total_limit: number; used_amount: number; remaining: number };
  remaining_benefit_after: number;
  pre_approval_required: boolean;
  pre_approval_limit: number;
  currency: string;
  guidance_message: string;
  cta: { label: string; action: string; target: string } | null;
}

export interface PreApprovalResult {
  success: boolean;
  request_id: number;
  policy_id: number;
  reason: string;
  estimated_amount: number;
  currency: string;
  status: string;
  guidance_message: string;
  submitted_at: string;
}

// ─── AI Chat types ────────────────────────────────────────────────────────────

export interface CoInsuranceRule {
  category: string;
  type: string;
  coinsurance_pct: number;
  annual_cap_sar: number | null;
  note: string;
}

export interface CoInsuranceRulesBinding {
  title: string;
  subtitle: string;
  rules: CoInsuranceRule[];
}

export interface Provider {
  name: string;
  specialty: string;
  city: string;
  distance_km: number;
  phone: string;
  maps_url: string;
}

export interface ProviderFinderBinding {
  title: string;
  subtitle: string;
  specialty: string;
  providers: Provider[];
  actions: string[];
}

export interface ClaimsTimelineStep {
  step: string;
  completed: boolean;
  date: string | null;
}

export interface ClaimsTrackerBinding {
  title: string;
  batch_id: string;
  status: string;
  status_label: string;
  procedure_type: string;
  amount_claimed_sar: number;
  amount_approved_sar: number | null;
  submitted_at: string;
  estimated_completion: string | null;
  documents_required: boolean;
  appeal_eligible: boolean;
  timeline: ClaimsTimelineStep[];
}

export interface ChatElement {
  element_id: string;
  slot: SlotType;
  priority?: number;
  variant_id?: string;
  data_binding:
    | CoInsuranceRulesBinding
    | ProviderFinderBinding
    | ClaimsTrackerBinding
    | Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  element?: { element_id: string; title: string };
}

// ─── Scenario presets matching test.md ───────────────────────────────────────

// Scenario presets matching test.md
export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  params: {
    member_id: number;
    procedure_type?: string;
    estimated_cost?: number;
    ixb?: Record<string, unknown>;
  };
}
