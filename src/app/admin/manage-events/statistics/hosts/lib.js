export const REVENUE_STATUSES = ["paid", "door", "cash", "card", "transfer"];

export function formatISK(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("en-US")} kr`;
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function getDateRange(timeFrame, customDateRange) {
  if (timeFrame === "all") return null;

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  let startDate = new Date(now);
  let endDate = new Date(now);

  switch (timeFrame) {
    case "week":
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "three_months":
      startDate.setMonth(now.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "custom":
      if (!customDateRange?.start || !customDateRange?.end) return null;
      startDate = new Date(customDateRange.start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customDateRange.end);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      return null;
  }

  return { startDate, endDate };
}

export function filterEventsByRange(events, { timeFrame, customDateRange, eventScope }) {
  const range = getDateRange(timeFrame, customDateRange);
  const now = new Date();

  return (events || []).filter((event) => {
    const eventDate = new Date(event.date);
    if (Number.isNaN(eventDate.getTime())) return false;

    if (range && (eventDate < range.startDate || eventDate > range.endDate)) {
      return false;
    }

    if (eventScope === "upcoming" && eventDate < now) return false;
    if (eventScope === "past" && eventDate >= now) return false;

    return true;
  });
}

export function buildEventFinance(event, eventTickets = [], eventPayments = []) {
  const revenueTickets = eventTickets.filter((ticket) =>
    REVENUE_STATUSES.includes(ticket.status)
  );

  const ticketCount = revenueTickets.reduce(
    (sum, ticket) => sum + Math.max(1, safeNumber(ticket.quantity) || 1),
    0
  );

  const grossRevenue = revenueTickets.reduce(
    (sum, ticket) => sum + safeNumber(ticket.total_price),
    0
  );

  const statusBreakdown = revenueTickets.reduce((acc, ticket) => {
    const key = ticket.status || "unknown";
    if (!acc[key]) {
      acc[key] = { tickets: 0, revenue: 0 };
    }
    acc[key].tickets += Math.max(1, safeNumber(ticket.quantity) || 1);
    acc[key].revenue += safeNumber(ticket.total_price);
    return acc;
  }, {});

  const paidToMama = eventPayments.reduce(
    (sum, payment) => sum + safeNumber(payment.amount),
    0
  );

  return {
    ...event,
    ticketCount,
    grossRevenue,
    paidToMama,
    paymentCount: eventPayments.length,
    coHosted: Boolean(event.host_secondary),
    tickets: revenueTickets,
    payments: [...eventPayments].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    ),
    statusBreakdown,
  };
}

export function buildHostFinanceRows(eventFinances = []) {
  const rows = new Map();

  for (const event of eventFinances) {
    const hostEntries = [
      event.host ? { email: event.host, role: "primary" } : null,
      event.host_secondary ? { email: event.host_secondary, role: "secondary" } : null,
    ].filter(Boolean);

    const seenEmails = new Set();
    for (const hostEntry of hostEntries) {
      const email = String(hostEntry.email).trim().toLowerCase();
      if (!email || seenEmails.has(email)) continue;
      seenEmails.add(email);

      if (!rows.has(email)) {
        rows.set(email, {
          hostEmail: email,
          eventCount: 0,
          coHostedCount: 0,
          ticketCount: 0,
          grossRevenue: 0,
          paidToMama: 0,
          paymentCount: 0,
          lastEventDate: null,
          events: [],
        });
      }

      const row = rows.get(email);
      const eventEntry = {
        ...event,
        hostRole: hostEntry.role,
      };

      row.eventCount += 1;
      if (event.coHosted) row.coHostedCount += 1;
      row.ticketCount += event.ticketCount;
      row.grossRevenue += event.grossRevenue;
      row.paidToMama += event.paidToMama;
      row.paymentCount += event.paymentCount;
      row.events.push(eventEntry);

      if (
        !row.lastEventDate ||
        new Date(event.date).getTime() > new Date(row.lastEventDate).getTime()
      ) {
        row.lastEventDate = event.date;
      }
    }
  }

  return Array.from(rows.values())
    .map((row) => ({
      ...row,
      events: row.events.sort((a, b) => new Date(b.date) - new Date(a.date)),
    }))
    .sort((a, b) => b.grossRevenue - a.grossRevenue);
}

export function buildUniqueSummary(eventFinances = [], hostRows = []) {
  return {
    uniqueEvents: eventFinances.length,
    activeHosts: hostRows.length,
    grossRevenue: eventFinances.reduce((sum, event) => sum + event.grossRevenue, 0),
    paymentsRecorded: eventFinances.reduce((sum, event) => sum + event.paidToMama, 0),
    paymentEntries: eventFinances.reduce((sum, event) => sum + event.paymentCount, 0),
    eventsWithPayments: eventFinances.filter((event) => event.paymentCount > 0).length,
    coHostedEvents: eventFinances.filter((event) => event.coHosted).length,
  };
}
