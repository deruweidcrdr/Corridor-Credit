"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { ds } from "@/lib/design-tokens";

const RAILWAY_URL = "https://email-processing-production-production.up.railway.app";

interface Props {
  navExpanded: boolean;
  onToggleNav: () => void;
  unreadCount: number;
}

interface PipelineStatus {
  pending: number;
  in_progress: number;
  error: number;
  complete: number;
  total: number;
  untracked: number;
}

export default function GlobalHeader({ navExpanded, onToggleNav, unreadCount }: Props) {
  // ── Polling state ──
  const [pollingOn, setPollingOn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${RAILWAY_URL}/api/polling/status`)
      .then((r) => r.json())
      .then((d) => setPollingOn(d.polling === "enabled" || d.polling_active === true || d.active === true))
      .catch(() => setPollingOn(false));
  }, []);

  // ── Pipeline status (LIVE indicator) ──
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);

  useEffect(() => {
    const fetchStatus = () =>
      fetch("/api/pipeline/status")
        .then((r) => r.json())
        .then((d: PipelineStatus) => setPipeline(d))
        .catch(() => {});
    fetchStatus();
    const id = setInterval(fetchStatus, 15_000);
    return () => clearInterval(id);
  }, []);

  const togglePolling = useCallback(async () => {
    const endpoint = pollingOn ? "stop" : "start";
    try {
      const r = await fetch(`${RAILWAY_URL}/api/polling/${endpoint}`, { method: "POST" });
      if (r.ok) setPollingOn(!pollingOn);
    } catch {
      // silently fail
    }
  }, [pollingOn]);

  const mono10: React.CSSProperties = {
    fontFamily: ds.fontMono,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  };

  return (
    <header
      style={{
        height: 44,
        flexShrink: 0,
        background: ds.surfaceDeep,
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 0,
        zIndex: 100,
      }}
    >
      {/* ── Left group: Nav toggle + Username + Separator + Institution ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
        {/* Nav toggle */}
        <button
          onClick={onToggleNav}
          style={{
            background: "transparent",
            border: "none",
            color: ds.textMuted,
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            marginRight: 12,
          }}
          title={navExpanded ? "Collapse navigation" : "Expand navigation"}
        >
          <Menu size={18} />
        </button>

        {/* Username */}
        <span style={{ ...mono10, color: ds.text, marginRight: 14 }}>
          Brent Elliott
        </span>

        {/* Vertical separator — aligns with nav panel right edge (240px) */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.10)",
            marginRight: 14,
          }}
        />

        {/* Institution */}
        <span style={{ ...mono10, color: ds.textDim }}>
          Corridor Credit
        </span>
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Right group: Polling + Live + Unread + separator + Active Workflows ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          ...mono10,
        }}
      >
        {/* Polling toggle */}
        <button
          onClick={togglePolling}
          disabled={pollingOn === null}
          style={{
            ...mono10,
            padding: "3px 10px",
            borderRadius: 10,
            border: `1px solid ${pollingOn ? "rgba(76,175,130,0.35)" : "rgba(255,255,255,0.12)"}`,
            background: pollingOn ? ds.greenDim : "rgba(255,255,255,0.05)",
            color: pollingOn ? ds.green : ds.textMuted,
            cursor: pollingOn === null ? "wait" : "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {pollingOn === null ? "POLLING: …" : pollingOn ? "POLLING: ON" : "POLLING: OFF"}
        </button>

        {/* Pipeline status indicator */}
        {(() => {
          const state = !pipeline
            ? "loading"
            : pipeline.in_progress > 0
              ? "processing"
              : pipeline.pending > 0
                ? "queued"
                : pipeline.error > 0
                  ? "error"
                  : "idle";

          const dotColor = {
            loading: ds.textMuted,
            processing: ds.amber,
            queued: ds.gold,
            error: ds.coral,
            idle: ds.green,
          }[state];

          const dotGlow = {
            loading: "transparent",
            processing: ds.amberDim,
            queued: ds.goldDim,
            error: ds.coralDim,
            idle: ds.greenDim,
          }[state];

          const labelColor = state === "idle" ? ds.textMuted : dotColor;

          const label = state === "loading"
            ? "\u2026"
            : state === "processing"
              ? `${pipeline!.in_progress} PROCESSING`
              : state === "queued"
                ? `${pipeline!.pending} QUEUED`
                : state === "error"
                  ? `${pipeline!.error} ERROR`
                  : pipeline!.complete > 0
                    ? `${pipeline!.complete} COMPLETE`
                    : pipeline!.total > 0
                      ? `${pipeline!.total} STAGED`
                      : "IDLE";

          const tooltip = pipeline
            ? [
                `${pipeline.total} staged records`,
                `${pipeline.complete} complete`,
                `${pipeline.pending} pending`,
                `${pipeline.in_progress} in progress`,
                `${pipeline.error} errors`,
                pipeline.untracked > 0 ? `${pipeline.untracked} awaiting dispatch` : "",
              ].filter(Boolean).join(" \u00b7 ")
            : "Loading pipeline status\u2026";

          return (
            <div
              style={{ display: "flex", alignItems: "center", gap: 5, color: labelColor }}
              title={tooltip}
            >
              {state === "processing" && (
                <style>{`@keyframes liveIndicatorPulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
              )}
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: dotColor,
                  boxShadow: `0 0 0 2px ${dotGlow}`,
                  display: "inline-block",
                  ...(state === "processing"
                    ? { animation: "liveIndicatorPulse 1.5s ease-in-out infinite" }
                    : {}),
                }}
              />
              <span>{label}</span>
            </div>
          );
        })()}

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            style={{
              background: ds.coralDim,
              color: ds.coral,
              border: "1px solid rgba(224,112,96,0.30)",
              padding: "2px 8px",
              borderRadius: 3,
            }}
          >
            {unreadCount} UNREAD
          </span>
        )}

        {/* Separator */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.08)",
          }}
        />

        {/* Active workflows badge */}
        <span
          style={{
            background: ds.goldDim,
            color: ds.gold,
            border: `1px solid rgba(200,168,75,0.30)`,
            padding: "2px 8px",
            borderRadius: 3,
          }}
        >
          4 ACTIVE WORKFLOWS
        </span>
      </div>
    </header>
  );
}
