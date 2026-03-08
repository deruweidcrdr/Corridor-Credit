import { supabase } from "./supabase";
import { getSeedInboxItems } from "./seed-data";
import type { InboxItemWithRelations } from "./database.types";

export async function getInboxItems(): Promise<InboxItemWithRelations[]> {
  // Try fetching from Supabase first
  try {
    const { data, error } = await supabase
      .from("inbox_items")
      .select("*, documents(*), counterparties(*)")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as unknown as InboxItemWithRelations[];
    }
  } catch {
    // Supabase not available — fall through to seed data
  }

  // Fall back to local seed data for development
  return getSeedInboxItems().sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
