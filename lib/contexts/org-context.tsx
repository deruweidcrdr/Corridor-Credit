"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserProfile {
  email: string;
  full_name: string | null;
  role: string | null;
}

interface Organization {
  name: string;
  org_type: string | null;
}

interface OrgContextValue {
  user: UserProfile | null;
  organization: Organization | null;
  isCorridorStaff: boolean;
  loading: boolean;
}

const OrgContext = createContext<OrgContextValue>({
  user: null,
  organization: null,
  isCorridorStaff: false,
  loading: true,
});

export function OrgProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<OrgContextValue>({
    user: null,
    organization: null,
    isCorridorStaff: false,
    loading: true,
  });

  useEffect(() => {
    async function load() {
      try {
        // Get current auth user
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          setValue({ user: null, organization: null, isCorridorStaff: false, loading: false });
          return;
        }

        // Try to load user_profile + organization
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("email, full_name, role, is_corridor_staff, org_id")
          .eq("id", authUser.id)
          .maybeSingle();

        let org: Organization | null = null;
        if (profile?.org_id) {
          const { data: orgData } = await supabase
            .from("organizations")
            .select("name, org_type")
            .eq("id", profile.org_id)
            .maybeSingle();
          org = orgData ?? null;
        }

        setValue({
          user: profile
            ? { email: profile.email, full_name: profile.full_name, role: profile.role }
            : { email: authUser.email ?? "", full_name: null, role: null },
          organization: org ?? { name: "Corridor Credit", org_type: "CORRIDOR_FUND" },
          isCorridorStaff: profile?.is_corridor_staff ?? true,
          loading: false,
        });
      } catch {
        // Fallback if tables don't exist yet
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setValue({
          user: { email: authUser?.email ?? "elliott@corridor.credit", full_name: null, role: "FUND_MANAGER" },
          organization: { name: "Corridor Credit", org_type: "CORRIDOR_FUND" },
          isCorridorStaff: true,
          loading: false,
        });
      }
    }
    load();
  }, []);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  return useContext(OrgContext);
}
