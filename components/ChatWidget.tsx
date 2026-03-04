"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, Sparkles, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, ChatElement } from "@/types/ix";

const ELEMENT_META: Record<string, { label: string; emoji: string }> = {
  CL_COINSURANCE_RULES_V1: { label: "Co-Insurance Rules",  emoji: "🛡️" },
  DT_PROVIDER_FINDER_V1:   { label: "Provider Finder",      emoji: "📍" },
  CL_CLAIMS_TRACKER_V1:    { label: "Claims Tracker",        emoji: "📋" },
};

interface Props {
  onNewElement: (element: ChatElement) => void;
  customerId?: number;
}

export function ChatWidget({ onNewElement, customerId = 1 }: Props) {
  const [value, setValue]         = useState("");
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [loading, setLoading]     = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const inputRef   = useRef<HTMLInputElement>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (hasMessages) setPanelOpen(true);
  }, [hasMessages]);

  const send = useCallback(async () => {
    const msg = value.trim();
    if (!msg || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: `usr_${Date.now()}`, role: "user", text: msg },
    ]);
    setValue("");
    setLoading(true);
    setPanelOpen(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          customer_message: msg,
          ...(sessionId ? { session_id: sessionId } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      if (data.session_id && !sessionId) setSessionId(data.session_id);

      const binding = data.element?.data_binding as Record<string, string> | undefined;
      setMessages((prev) => [
        ...prev,
        {
          id:   data.message_id ?? `ast_${Date.now()}`,
          role: "assistant",
          text: data.text ?? "",
          element: data.element
            ? {
                element_id: data.element.element_id,
                title: binding?.title ?? data.element.element_id,
              }
            : undefined,
        },
      ]);

      if (data.element) {
        onNewElement(data.element as ChatElement);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id:   `err_${Date.now()}`,
          role: "assistant",
          text: "Sorry, I couldn't reach the AI backend. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [value, loading, sessionId, customerId, onNewElement]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 flex flex-col gap-2">

      {/* ── Messages panel ────────────────────────────────────────────── */}
      {panelOpen && hasMessages && (
        <div className={cn(
          "animate-in fade-in slide-in-from-bottom-2 duration-200 rounded-2xl border backdrop-blur-md shadow-[0_8px_48px_rgba(0,0,0,0.4)] overflow-hidden",
          "border-neutral-200 bg-white/98 dark:border-neutral-800 dark:bg-neutral-950/98 dark:shadow-[0_8px_48px_rgba(0,0,0,0.75)]"
        )}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200/80 dark:border-neutral-800/80">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-900 dark:bg-white">
                <Sparkles className="h-2.5 w-2.5 text-white dark:text-black" />
              </div>
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                IX AI Assistant
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="max-h-[40vh] overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {/* AI avatar */}
                {msg.role === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-900 dark:bg-white mt-0.5 mr-2">
                    <Sparkles className="h-3 w-3 text-white dark:text-black" />
                  </div>
                )}

                <div
                  className={cn(
                    "flex flex-col gap-1.5",
                    msg.role === "user" ? "items-end max-w-[78%]" : "items-start max-w-[82%]"
                  )}
                >
                  {/* Bubble */}
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-br-sm"
                        : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100 rounded-bl-sm"
                    )}
                  >
                    {msg.text ||
                      (msg.element
                        ? `Here is the ${
                            ELEMENT_META[msg.element.element_id]?.label ??
                            msg.element.element_id
                          }.`
                        : "")}
                  </div>

                  {/* Element chip */}
                  {msg.element && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700/50 dark:bg-neutral-900 px-2.5 py-1.5 text-[10px]">
                      <span>{ELEMENT_META[msg.element.element_id]?.emoji ?? "⬡"}</span>
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                        {ELEMENT_META[msg.element.element_id]?.label ??
                          msg.element.title}
                      </span>
                      <span className="text-neutral-400 dark:text-neutral-600">· added below ↓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-900 dark:bg-white mt-0.5 mr-2">
                  <Sparkles className="h-3 w-3 text-white dark:text-black" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-neutral-100 dark:bg-neutral-800 px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="block h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* ── Collapsed pill ────────────────────────────────────────────── */}
      {hasMessages && !panelOpen && (
        <div className="flex justify-center">
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] transition-colors backdrop-blur-sm border-neutral-300 bg-white/90 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
          >
            <Sparkles className="h-2.5 w-2.5" />
            {messages.length} message{messages.length !== 1 ? "s" : ""}
            <span className="text-neutral-400 dark:text-neutral-600">· tap to expand</span>
          </button>
        </div>
      )}

      {/* ── Input bar ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border backdrop-blur-md px-4 py-3",
          "shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-200",
          loading
            ? "border-neutral-300 bg-white/95 dark:border-neutral-700 dark:bg-neutral-950/95"
            : "border-neutral-300 bg-white/95 hover:border-neutral-400 focus-within:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950/95 dark:hover:border-neutral-500 dark:focus-within:border-neutral-400"
        )}
      >
        {/* AI indicator */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-900 dark:bg-white">
          <Sparkles className="h-3 w-3 text-white dark:text-black" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask about your coverage, costs, or benefits…"
          className={cn(
            "flex-1 bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "text-neutral-900 placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          )}
        />

        {/* Send button */}
        <button
          onClick={send}
          disabled={!value.trim() || loading}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all",
            value.trim() && !loading
              ? "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200 active:scale-95"
              : "bg-neutral-200 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600"
          )}
        >
          {loading ? (
            <span className="h-3 w-3 rounded-full border-2 border-neutral-400 border-t-neutral-700 dark:border-neutral-500 dark:border-t-neutral-200 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
