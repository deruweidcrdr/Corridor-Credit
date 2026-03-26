"use client";

import { useState, useEffect, type ReactNode } from "react";
import GlobalHeader from "./global-header";
import NavPanel from "./nav-panel";
import { OrgProvider } from "@/lib/contexts/org-context";
import { ds } from "@/lib/design-tokens";

interface Props {
  children: ReactNode;
}

export default function AppShell({ children }: Props) {
  const [navExpanded, setNavExpanded] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load unread count from inbox API
  useEffect(() => {
    fetch("/api/inbox/unread-count")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  return (
    <OrgProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          background: ds.bg,
          color: ds.text,
          fontFamily: ds.fontBody,
        }}
      >
        <GlobalHeader
          navExpanded={navExpanded}
          onToggleNav={() => setNavExpanded((p) => !p)}
          unreadCount={unreadCount}
        />
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <NavPanel expanded={navExpanded} />
          <main
            style={{
              flex: 1,
              overflow: "auto",
              minWidth: 0,
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </OrgProvider>
  );
}
