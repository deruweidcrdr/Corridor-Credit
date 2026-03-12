import { fetchInboxData } from "@/lib/inbox-queries";
import InboxClient from "./inbox-client";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { emails, notifications } = await fetchInboxData();
  return <InboxClient emails={emails} notifications={notifications} />;
}
