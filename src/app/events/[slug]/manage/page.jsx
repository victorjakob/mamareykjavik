import { redirect } from "next/navigation";
import { resolveEventAccess } from "@/lib/eventAccess";
import { createServerSupabase } from "@/util/supabase/server";
import ManageHub from "./ManageHub";
import ManageDenied from "./ManageDenied";

// Always server-rendered: access depends on session/cookie, never cache it.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Manage event | Mama Reykjavik",
  // A private host surface — keep it out of search engines.
  robots: { index: false, follow: false },
};

export default async function EventManagePage({ params, searchParams }) {
  const { slug } = await params;
  const sp = (await searchParams) || {};
  const k = Array.isArray(sp.k) ? sp.k[0] : sp.k;
  const denied = Array.isArray(sp.denied) ? sp.denied[0] : sp.denied;

  // A token in the URL means a fresh email link. Hand off to the entry route,
  // which validates it, drops the secure httpOnly cookie, and bounces back to
  // the clean URL — so the secret never lingers in the address bar or history.
  if (k) {
    redirect(
      `/events/${encodeURIComponent(slug)}/manage/enter?k=${encodeURIComponent(k)}`
    );
  }

  const access = await resolveEventAccess(slug, {});

  if (access.notFound) return <ManageDenied reason="notfound" slug={slug} />;
  if (!access.allowed) {
    return <ManageDenied reason={denied ? "denied" : "auth"} slug={slug} />;
  }

  // Authorised — gather a light Overview summary (counts only).
  const supabase = createServerSupabase();
  const { data: tickets } = await supabase
    .from("tickets")
    .select("quantity, total_price, price, used")
    .eq("event_id", access.event.id)
    .in("status", ["paid", "door", "cash", "card", "transfer"]);

  const rows = tickets || [];
  const soldCount = rows.reduce((s, t) => s + (t.quantity || 0), 0);
  const revenue = rows.reduce(
    (s, t) =>
      s +
      (t.total_price != null
        ? Number(t.total_price)
        : Number(t.price || 0) * (t.quantity || 0)),
    0
  );
  const checkedIn = rows.reduce(
    (s, t) => s + (t.used ? t.quantity || 0 : 0),
    0
  );

  return (
    <ManageHub
      event={access.event}
      mode={access.mode}
      summary={{ soldCount, revenue, checkedIn }}
    />
  );
}
