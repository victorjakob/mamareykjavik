// Shared report builder used by both the live /report endpoint and the
// /close endpoint (which returns the report inline so the reconciliation
// screen can render without an extra fetch).

export async function buildReport(supabase, event) {
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select(
      "id, buyer_name, buyer_email, quantity, status, used, created_at, price, total_price, variant_name, gatekeeper, gatekeeper_tip, gatekeeper_note, gatekeeper_receipt_requested"
    )
    .eq("event_id", event.id)
    .in("status", ["paid", "door", "cash", "card", "transfer", "exchange"]);

  if (error) throw error;

  const rows = tickets || [];

  const totals = rows.reduce(
    (acc, t) => {
      const q = Number(t.quantity || 1);
      const total = Number(t.total_price || 0);
      const tip = Number(t.gatekeeper_tip || 0);
      const priceless = Math.max(0, total - tip);

      acc.tickets += q;
      if (t.used) acc.checkedIn += q;
      acc.revenue += priceless;
      acc.tipsTotal += tip;

      const key =
        t.status === "paid" ? "online" :
        t.status === "cash" ? "cash" :
        t.status === "card" ? "pos" :
        t.status === "transfer" ? "transfer" :
        t.status === "exchange" ? "exchange" :
        "door";
      acc.byMethod[key] = acc.byMethod[key] || { tickets: 0, revenue: 0 };
      acc.byMethod[key].tickets += q;
      acc.byMethod[key].revenue += priceless;

      if (t.gatekeeper) {
        acc.walkIns += q;
        if (tip > 0) acc.tippers += 1;
      }
      return acc;
    },
    {
      tickets: 0,
      checkedIn: 0,
      walkIns: 0,
      revenue: 0,
      tipsTotal: 0,
      tippers: 0,
      byMethod: {},
    }
  );

  const walkInList = rows
    .filter((t) => t.gatekeeper)
    .map((t) => ({
      id: t.id,
      name: t.buyer_name,
      email: t.buyer_email,
      method:
        t.status === "cash" ? "Cash" :
        t.status === "card" ? "POS" :
        t.status === "transfer" ? "Transfer" :
        t.status === "exchange" ? "Exchange" : t.status,
      price: Number(t.price || 0),
      tip: Number(t.gatekeeper_tip || 0),
      total: Number(t.total_price || 0),
      note: t.gatekeeper_note || null,
      receipt: !!t.gatekeeper_receipt_requested,
      created_at: t.created_at,
    }));

  return {
    event: {
      id: event.id,
      name: event.name,
      slug: event.slug,
      date: event.date,
      price: event.price,
    },
    totals,
    walkIns: walkInList,
  };
}
