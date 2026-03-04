"use client";

import { useState } from "react";
import { MapPin, Phone, Navigation, ShieldCheck, CalendarDays, CheckCircle2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderFinderBinding, Provider } from "@/types/ix";
import { cn } from "@/lib/utils";

interface Props {
  binding: ProviderFinderBinding;
}

// ── Build next 7 days as chips ─────────────────────────────────────────────
function getNextDays(n: number) {
  const days: { label: string; sublabel: string; key: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      label:    d.toLocaleDateString("en-SA", { weekday: "short" }),
      sublabel: d.toLocaleDateString("en-SA", { day: "numeric", month: "short" }),
      key:      d.toISOString().slice(0, 10),
    });
  }
  return days;
}

const DATE_CHIPS = getNextDays(7);
const TIME_SLOTS = ["Morning", "Afternoon", "Evening"] as const;
type TimeSlot = typeof TIME_SLOTS[number];

type BookingState =
  | { phase: "idle" }
  | { phase: "pick_date" }
  | { phase: "pick_time"; date: string }
  | { phase: "confirmed"; date: string; time: TimeSlot };

function ProviderCard({ provider, actions }: { provider: Provider; actions: string[] }) {
  const [booking, setBooking] = useState<BookingState>({ phase: "idle" });
  const [coverOpen, setCoverOpen] = useState(false);

  function startBook() { setBooking({ phase: "pick_date" }); }
  function pickDate(key: string) { setBooking({ phase: "pick_time", date: key }); }
  function pickTime(time: TimeSlot) {
    if (booking.phase !== "pick_time") return;
    setBooking({ phase: "confirmed", date: booking.date, time });
  }
  function cancel() { setBooking({ phase: "idle" }); }

  const confirmedDate = booking.phase === "confirmed"
    ? DATE_CHIPS.find((d) => d.key === booking.date)
    : null;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 space-y-3">
      {/* Name + distance */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-100">{provider.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="h-3 w-3 text-neutral-500" />
            <span className="text-xs text-neutral-400">{provider.city}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono shrink-0 tabular-nums">
          {provider.distance_km} km
        </Badge>
      </div>

      {/* Confirmed state */}
      {booking.phase === "confirmed" && confirmedDate && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-300">Appointment Requested</p>
            <p className="text-[10px] text-emerald-400/70 mt-0.5">
              {provider.name} · {confirmedDate.label} {confirmedDate.sublabel} · {booking.time}
            </p>
            <p className="text-[10px] text-emerald-600 mt-1">
              The clinic will contact you to confirm.
            </p>
          </div>
          <button onClick={cancel} className="text-emerald-600 hover:text-emerald-400 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Booking flow */}
      {booking.phase === "pick_date" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Pick a date</p>
            <button onClick={cancel} className="text-neutral-600 hover:text-neutral-400 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DATE_CHIPS.map((d) => (
              <button
                key={d.key}
                onClick={() => pickDate(d.key)}
                className="flex flex-col items-center rounded-lg border border-neutral-700 bg-neutral-800/80 px-2.5 py-2 text-center shrink-0 hover:border-white/50 hover:bg-white/5 transition-all"
              >
                <span className="text-[9px] text-neutral-500 uppercase">{d.label}</span>
                <span className="text-xs font-medium text-neutral-200 mt-0.5">{d.sublabel}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {booking.phase === "pick_time" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
              {DATE_CHIPS.find((d) => d.key === booking.date)?.label}{" "}
              {DATE_CHIPS.find((d) => d.key === booking.date)?.sublabel} — pick a slot
            </p>
            <button onClick={cancel} className="text-neutral-600 hover:text-neutral-400 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => pickTime(slot)}
                className="rounded-lg border border-neutral-700 bg-neutral-800/80 py-2 text-xs text-neutral-300 hover:border-white/50 hover:bg-white/5 transition-all"
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Coverage panel */}
      {coverOpen && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-150 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300 space-y-1">
          <p className="font-medium">In-network provider</p>
          <p className="text-emerald-400/70 text-[11px]">Your dental benefit covers services here with NIL co-insurance. Always confirm cover with reception before treatment.</p>
          <button onClick={() => setCoverOpen(false)} className="text-[10px] text-emerald-600 hover:text-emerald-400 transition-colors mt-1">
            Close
          </button>
        </div>
      )}

      {/* Action buttons */}
      {booking.phase === "idle" && (
        <div className="grid grid-cols-4 gap-1.5">
          {(actions as string[]).map((action) => {
            if (action === "check_coverage") return (
              <button
                key={action}
                onClick={() => setCoverOpen((v) => !v)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-[10px] transition-colors",
                  coverOpen
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-neutral-700 bg-neutral-800/80 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Coverage
              </button>
            );
            if (action === "call") return (
              <a
                key={action}
                href={provider.phone ? `tel:${provider.phone}` : undefined}
                className="flex flex-col items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800/80 px-2 py-2.5 text-[10px] text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
            );
            if (action === "directions") return (
              <button
                key={action}
                onClick={() => provider.maps_url && window.open(provider.maps_url, "_blank", "noopener")}
                className="flex flex-col items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800/80 px-2 py-2.5 text-[10px] text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-colors"
              >
                <Navigation className="h-3.5 w-3.5" />
                Directions
              </button>
            );
            if (action === "book") return (
              <button
                key={action}
                onClick={startBook}
                className="flex flex-col items-center gap-1 rounded-lg border border-white/20 bg-white/8 px-2 py-2.5 text-[10px] text-neutral-200 hover:bg-white/15 hover:border-white/30 transition-colors"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Book
              </button>
            );
            return null;
          })}
        </div>
      )}

      {/* Re-book option after confirmed */}
      {booking.phase === "confirmed" && (
        <button
          onClick={cancel}
          className="w-full text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors text-center"
        >
          Change appointment →
        </button>
      )}
    </div>
  );
}

export function ProviderFinder({ binding }: Props) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700/50">
            <MapPin className="h-4 w-4 text-neutral-300" />
          </div>
          <div>
            <CardTitle className="text-sm">{binding.title}</CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">{binding.subtitle}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {binding.providers.map((provider, i) => (
          <ProviderCard key={i} provider={provider} actions={binding.actions} />
        ))}
      </CardContent>
    </Card>
  );
}
