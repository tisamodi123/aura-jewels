import { redirect } from "next/navigation";

// Settings landing page — staff management is the most common entry
// point so we open Users by default. Language/currency was the old
// landing target but is a less frequently-touched config screen.
export default function SettingsPage() {
  redirect("/settings/users");
}
