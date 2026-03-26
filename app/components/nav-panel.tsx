"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  FileText,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Building2,
} from "lucide-react";
import { ds } from "@/lib/design-tokens";
import type { ComponentType } from "react";

/* ------------------------------------------------------------------ */
/*  Navigation configuration                                           */
/* ------------------------------------------------------------------ */
const NAV_ITEMS: {
  label: string;
  href: string;
  workbenchLabel: string;
  icon: ComponentType<{ size?: number }>;
}[] = [
  { label: "Inbox & Alerts", href: "/inbox", workbenchLabel: "Inbox", icon: Inbox },
  { label: "Contract Analysis", href: "/contract-analysis", workbenchLabel: "Contract", icon: FileText },
  { label: "Statement Analysis", href: "/statement-analysis", workbenchLabel: "Statement Analysis", icon: BarChart3 },
  { label: "Projections", href: "/projections", workbenchLabel: "Projections", icon: TrendingUp },
  { label: "Credit Analysis", href: "/credit-analysis", workbenchLabel: "Credit Analysis", icon: ShieldCheck },
  { label: "Approvals", href: "/approvals", workbenchLabel: "Approvals", icon: CheckCircle },
  { label: "Enterprise", href: "/enterprise", workbenchLabel: "Enterprise", icon: Building2 },
];

const NAV_EXPANDED_WIDTH = 240;
const NAV_COLLAPSED_WIDTH = 60;

/* ------------------------------------------------------------------ */
/*  Logo components                                                    */
/* ------------------------------------------------------------------ */

/** CR/DR monogram as inline SVG with gradient fill */
function CRDRMonogram({ size = 36 }: { size?: number }) {
  const id = "crdr-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4877a" />
          <stop offset="50%" stopColor="#d4a67a" />
          <stop offset="100%" stopColor="#d4c878" />
        </linearGradient>
      </defs>
      <text
        x="50"
        y="38"
        textAnchor="middle"
        dominantBaseline="central"
        fill={`url(#${id})`}
        fontFamily="'Syne', sans-serif"
        fontWeight="700"
        fontSize="28"
        letterSpacing="1"
      >
        CR
      </text>
      {/* Spacer — slash removed for cleaner stacked CR/DR presentation */}
      <text
        x="50"
        y="68"
        textAnchor="middle"
        dominantBaseline="central"
        fill={`url(#${id})`}
        fontFamily="'Syne', sans-serif"
        fontWeight="700"
        fontSize="28"
        letterSpacing="1"
      >
        DR
      </text>
    </svg>
  );
}

/** Full CORRIDOR CREDIT wordmark with gradient */
function CorridorWordmark() {
  const id = "wordmark-grad";
  return (
    <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
      <svg width="180" height="34" viewBox="0 0 180 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c4877a" />
            <stop offset="50%" stopColor="#d4a67a" />
            <stop offset="100%" stopColor="#d4c878" />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="24"
          fill={`url(#${id})`}
          fontFamily="'Syne', sans-serif"
          fontWeight="700"
          fontSize="22"
          letterSpacing="3"
        >
          CORRIDOR
        </text>
      </svg>
      <span
        style={{
          fontFamily: ds.fontBody,
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: "3.5px",
          color: "rgba(228,232,240,0.65)",
          marginTop: -2,
        }}
      >
        CREDIT
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NavPanel                                                           */
/* ------------------------------------------------------------------ */
interface Props {
  expanded: boolean;
}

export default function NavPanel({ expanded }: Props) {
  const pathname = usePathname();
  const activeItem = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
  const workbenchTitle = activeItem ? `Workbench: ${activeItem.workbenchLabel}` : "Workbench";

  return (
    <aside
      style={{
        width: expanded ? NAV_EXPANDED_WIDTH : NAV_COLLAPSED_WIDTH,
        flexShrink: 0,
        background: "#111820",
        borderRight: "1px solid #1e2d3d",
        display: "flex",
        flexDirection: "column",
        transition: "width 200ms ease",
        overflow: "hidden",
      }}
    >
      {/* ── Logo area ── */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {expanded ? (
          <div style={{ opacity: 1, transition: "opacity 150ms ease" }}>
            <CorridorWordmark />
          </div>
        ) : (
          <div style={{ opacity: 1, transition: "opacity 150ms ease" }}>
            <CRDRMonogram size={40} />
          </div>
        )}
      </div>

      {/* ── Section label (expanded only) ── */}
      {expanded && (
        <div style={{ padding: "0 16px 8px", overflow: "hidden", whiteSpace: "nowrap" }}>
          <span
            style={{
              color: ds.gold,
              fontFamily: ds.fontBody,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {workbenchTitle}
          </span>
        </div>
      )}

      {/* ── Navigation items ── */}
      <nav
        style={{
          flex: 1,
          padding: expanded ? "0 8px" : "0 6px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={expanded ? undefined : item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: expanded ? "6px 12px" : "8px 0",
                justifyContent: expanded ? "flex-start" : "center",
                borderRadius: ds.radius,
                fontSize: 13,
                fontFamily: ds.fontBody,
                textDecoration: "none",
                color: isActive ? "#60a5fa" : "#8b9bb4",
                background: isActive ? "#1a2a40" : "transparent",
                fontWeight: isActive ? 500 : 400,
                transition: "background 0.15s ease, color 0.15s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "#1a2332";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={16} />
              {expanded && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { NAV_EXPANDED_WIDTH, NAV_COLLAPSED_WIDTH };
