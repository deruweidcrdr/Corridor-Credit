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

export default function GlobalHeader({ navExpanded, onToggleNav, unreadCount }: Props) {
  // ── Polling state ──
  const [pollingOn, setPollingOn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${RAILWAY_URL}/api/polling/status`)
      .then((r) => r.json())
      .then((d) => setPollingOn(d.polling_active ?? d.active ?? false))
      .catch(() => setPollingOn(false));
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

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: ds.textMuted }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: ds.green,
              boxShadow: `0 0 0 2px ${ds.greenDim}`,
              display: "inline-block",
            }}
          />
          <span>LIVE</span>
        </div>

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
