"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Colour / style tokens                                              */
/* ------------------------------------------------------------------ */
const SURFACE = "bg-[#111820]";
const BORDER = "border-[#1e2d3d]";
const TEXT1 = "text-[#e2e8f0]";
const TEXT2 = "text-[#8b9bb4]";
const TEXT3 = "text-[#5a6a7e]";

/* ------------------------------------------------------------------ */
/*  Navigation configuration                                           */
/* ------------------------------------------------------------------ */
const NAV_ITEMS: { label: string; href: string; workbenchLabel: string }[] = [
  { label: "Inbox & Alerts", href: "/inbox", workbenchLabel: "Inbox" },
  { label: "Contract Analysis", href: "/contract-analysis", workbenchLabel: "Contract" },
  { label: "Statement Analysis", href: "/statement-analysis", workbenchLabel: "Statement Analysis" },
  { label: "Projections", href: "/projections", workbenchLabel: "Projections" },
  { label: "Credit Analysis", href: "/credit-analysis", workbenchLabel: "Credit Analysis" },
  { label: "Approvals", href: "/approvals", workbenchLabel: "Approvals" },
  { label: "Enterprise", href: "/enterprise", workbenchLabel: "Enterprise" },
];

/* ------------------------------------------------------------------ */
/*  Sidebar component                                                  */
/* ------------------------------------------------------------------ */
export default function Sidebar() {
  const pathname = usePathname();

  const activeItem = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
  const workbenchTitle = activeItem
    ? `Workbench: ${activeItem.workbenchLabel}`
    : "Workbench";

  return (
    <aside
      className={`w-[172px] shrink-0 ${SURFACE} border-r ${BORDER} flex flex-col`}
    >
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Logo />
        <span className={`${TEXT3} text-lg`}>&#8801;</span>
      </div>

      {/* Section label — gold, reflects active page */}
      <div className="px-4 pb-2">
        <span className="text-[#d4a843] text-[13px] font-semibold">
          {workbenchTitle}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block w-full text-left px-3 py-1.5 rounded text-[13px] transition-colors ${
                isActive
                  ? "bg-[#1a2a40] text-blue-400 font-medium"
                  : `${TEXT2} hover:bg-[#1a2332]`
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Logo() {
  return (
    <div className="flex items-baseline gap-0 select-none">
      <span className={`text-[15px] font-bold tracking-tight ${TEXT1}`}>
        CR
      </span>
      <span className={`text-[15px] font-light ${TEXT3} mx-px`}>/</span>
      <span className={`text-[15px] font-bold tracking-tight ${TEXT1}`}>
        DR
      </span>
    </div>
  );
}
