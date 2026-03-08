import { emails, notifications } from "@/lib/inbox-data";
import InboxClient from "./inbox-client";

export default function InboxPage() {
  return <InboxClient emails={emails} notifications={notifications} />;
}
