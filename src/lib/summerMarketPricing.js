/**
 * Summer Market vendor pricing (public page: PricingSection).
 * Used for admin estimates — keep in sync with marketing copy.
 */

export const SUMMER_MARKET_PRICING = {
  /** Single market day (incl. VSK) */
  singleDayKr: 8500,
  /** Fri + Sat + Sun same weekend (incl. VSK) */
  weekendBundleKr: 19000,
  /**
   * Confirmation / reservation fee — **per weekend** that includes at least one selected day
   * (same 3.500 kr whether they book 1, 2, or all 3 days of that weekend).
   */
  confirmationFeePerWeekendKr: 3500,
  /** @deprecated use confirmationFeePerWeekendKr */
  reservationFeeKr: 3500,
  /** Tablecloth rental add-on */
  tableclothRentalKr: 2900,
};

/**
 * Weekends as shown on the apply form and admin calendar.
 * Order must match how vendors pick dates.
 */
export const SUMMER_MARKET_WEEKEND_GROUPS = [
  ["Fri June 6", "Sat June 7", "Sun June 8"],
  ["Fri June 13", "Sat June 14", "Sun June 15"],
  ["Fri June 20", "Sat June 21", "Sun June 22"],
  ["Fri June 27", "Sat June 28", "Sun June 29"],
  ["Fri July 4", "Sat July 5", "Sun July 6"],
  ["Fri July 11", "Sat July 12", "Sun July 13"],
  ["Fri July 18", "Sat July 19", "Sun July 20"],
  ["Fri July 25", "Sat July 26", "Sun July 27"],
];

export const SUMMER_MARKET_ALL_DATES = SUMMER_MARKET_WEEKEND_GROUPS.flat();

/**
 * @param {string[]} selectedDates - e.g. from application.selected_dates
 * @param {boolean} tableclothRental
 * @returns {{
 *   lines: { label: string; amountKr: number; kind: 'weekend'|'single'|'unknown'|'addon' }[];
 *   boothSubtotalKr: number;
 *   tableclothKr: number;
 *   confirmationWeekendCount: number;
 *   confirmationTotalKr: number;
 *   confirmationFeePerWeekendKr: number;
 *   grandTotalKr: number;
 *   remainingAfterConfirmationKr: number;
 *   unknownDates: string[];
 * }}
 */
export function calculateSummerMarketVendorEstimate(
  selectedDates = [],
  tableclothRental = false
) {
  const { singleDayKr, weekendBundleKr, confirmationFeePerWeekendKr, tableclothRentalKr } =
    SUMMER_MARKET_PRICING;

  const selected = new Set(
    Array.isArray(selectedDates) ? selectedDates.filter(Boolean) : []
  );
  const lines = [];
  let boothSubtotalKr = 0;

  for (const group of SUMMER_MARKET_WEEKEND_GROUPS) {
    const inGroup = group.filter((d) => selected.has(d));
    if (inGroup.length === 0) continue;

    if (inGroup.length === 3) {
      lines.push({
        kind: "weekend",
        label: `Weekend bundle (Fri–Sun · ${shortWeekendLabel(inGroup)})`,
        amountKr: weekendBundleKr,
      });
      boothSubtotalKr += weekendBundleKr;
      inGroup.forEach((d) => selected.delete(d));
    } else {
      for (const d of inGroup) {
        lines.push({
          kind: "single",
          label: `Single day · ${d}`,
          amountKr: singleDayKr,
        });
        boothSubtotalKr += singleDayKr;
        selected.delete(d);
      }
    }
  }

  const unknownDates = [];
  for (const d of selected) {
    lines.push({
      kind: "unknown",
      label: `Single day · ${d} (not in standard calendar — charged as single day)`,
      amountKr: singleDayKr,
    });
    boothSubtotalKr += singleDayKr;
    unknownDates.push(d);
  }

  const tableclothKr = tableclothRental ? tableclothRentalKr : 0;
  if (tableclothKr > 0) {
    lines.push({
      kind: "addon",
      label: "Tablecloth rental (one fee for all selected dates)",
      amountKr: tableclothKr,
    });
  }

  const confirmationWeekendCount = countConfirmationWeekends(
    Array.isArray(selectedDates) ? selectedDates : []
  );
  const confirmationTotalKr = confirmationWeekendCount * confirmationFeePerWeekendKr;
  const grandTotalKr = boothSubtotalKr + tableclothKr;
  const remainingAfterConfirmationKr = Math.max(0, grandTotalKr - confirmationTotalKr);

  return {
    lines,
    boothSubtotalKr,
    tableclothKr,
    confirmationWeekendCount,
    confirmationTotalKr,
    confirmationFeePerWeekendKr,
    grandTotalKr,
    remainingAfterConfirmationKr,
    unknownDates,
  };
}

/**
 * One confirmation fee per calendar weekend that has at least one selected day.
 * Unknown dates (not on our calendar) each count as one weekend for fee purposes.
 */
function countConfirmationWeekends(selectedDates) {
  const sel = new Set(selectedDates.filter(Boolean));
  if (sel.size === 0) return 0;

  const knownSet = new Set(SUMMER_MARKET_ALL_DATES);
  let count = 0;

  for (const group of SUMMER_MARKET_WEEKEND_GROUPS) {
    if (group.some((d) => sel.has(d))) count += 1;
  }

  for (const d of sel) {
    if (!knownSet.has(d)) count += 1;
  }

  return count;
}

function shortWeekendLabel(dates) {
  if (!dates.length) return "";
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first === last ? first : `${first} – ${last}`;
}

/** Format kr for display (e.g. 8.500 kr) */
export function formatKr(amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—";
  return `${amount.toLocaleString("de-DE")} kr`;
}

export function summarizeAcceptanceEmailDates(selectedDates = []) {
  const selected = new Set(
    Array.isArray(selectedDates) ? selectedDates.filter(Boolean) : []
  );
  const labels = [];

  for (const group of SUMMER_MARKET_WEEKEND_GROUPS) {
    const inGroup = group.filter((date) => selected.has(date));
    if (inGroup.length === 0) continue;

    if (inGroup.length === 3) {
      labels.push(`${group[0]} - ${group[2]}`);
      inGroup.forEach((date) => selected.delete(date));
      continue;
    }

    inGroup.forEach((date) => {
      labels.push(date);
      selected.delete(date);
    });
  }

  for (const date of selected) {
    labels.push(date);
  }

  return labels;
}

export function escapeHtmlForEmail(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Plain + HTML fragments for the “estimated pricing” block in acceptance emails.
 */
export function buildAcceptanceEmailPricingBlocks(
  selectedDates = [],
  tableclothRental = false
) {
  const p = calculateSummerMarketVendorEstimate(selectedDates, Boolean(tableclothRental));

  if (!p.lines.length && p.grandTotalKr === 0) {
    const fallback =
      "No pricing estimate (no days selected). Please reply to this email if you need a quote.";
    return {
      plainText: fallback,
      htmlFragment: `<p style="margin:0;font-size:14px;color:#6b5a4a;line-height:1.5;">${escapeHtmlForEmail(fallback)}</p>`,
      estimate: p,
    };
  }

  const weekendBundleCount = p.lines.filter((line) => line.kind === "weekend").length;
  const singleDayCount = p.lines.filter(
    (line) => line.kind === "single" || line.kind === "unknown"
  ).length;
  const summaryLines = [];

  if (weekendBundleCount > 0) {
    summaryLines.push({
      label: `${weekendBundleCount} weekend bundle${
        weekendBundleCount === 1 ? "" : "s"
      } x ${formatKr(SUMMER_MARKET_PRICING.weekendBundleKr)}`,
      amountKr: weekendBundleCount * SUMMER_MARKET_PRICING.weekendBundleKr,
    });
  }

  if (singleDayCount > 0) {
    summaryLines.push({
      label: `${singleDayCount} single day${
        singleDayCount === 1 ? "" : "s"
      } x ${formatKr(SUMMER_MARKET_PRICING.singleDayKr)}`,
      amountKr: singleDayCount * SUMMER_MARKET_PRICING.singleDayKr,
    });
  }

  if (p.tableclothKr > 0) {
    summaryLines.push({
      label: "Tablecloth rental",
      amountKr: p.tableclothKr,
    });
  }

  const plainText = [
    "Estimated total booking price (incl. VSK):",
    ...summaryLines.map((line) => `- ${line.label} = ${formatKr(line.amountKr)}`),
    "",
    `Total booking value: ${formatKr(p.grandTotalKr)}`,
    ...(p.confirmationTotalKr > 0
      ? [
          "",
          "To confirm and reserve your booth, we only require the confirmation fee now:",
          `- Confirmation fee: ${p.confirmationWeekendCount} weekend${
            p.confirmationWeekendCount === 1 ? "" : "s"
          } x ${formatKr(p.confirmationFeePerWeekendKr)} = ${formatKr(
            p.confirmationTotalKr
          )}`,
        ]
      : []),
  ].join("\n");

  const rows = summaryLines
    .map(
      (line) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eadfd2;color:#4e4038;font-size:14px;">${escapeHtmlForEmail(line.label)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eadfd2;text-align:right;font-weight:600;color:#20150f;white-space:nowrap;">${escapeHtmlForEmail(formatKr(line.amountKr))}</td>
    </tr>`
    )
    .join("");

  const htmlFragment = `
  <div style="margin:18px 0;padding:16px 18px;background:#fbf7f1;border:1px solid #eadfd2;border-radius:12px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9a724d;">Estimated total booking price</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${rows}
      <tr>
        <td style="padding:12px 10px 0;font-size:14px;font-weight:700;color:#20150f;">Total booking value</td>
        <td style="padding:12px 10px 0;text-align:right;font-size:16px;font-weight:700;color:#9a724d;">${escapeHtmlForEmail(formatKr(p.grandTotalKr))}</td>
      </tr>
    </table>
    ${
      p.confirmationTotalKr > 0
        ? `<div style="margin:14px 0 0;padding:12px 14px;background:#fff;border:1px solid #eadfd2;border-radius:10px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9a724d;">Pay now to confirm</p>
            <p style="margin:0 0 6px;font-size:14px;color:#20150f;line-height:1.55;">To confirm and reserve your booth, we only require the confirmation fee now:</p>
            <p style="margin:0;font-size:14px;color:#20150f;line-height:1.55;"><strong>Confirmation fee:</strong> ${p.confirmationWeekendCount} weekend${
              p.confirmationWeekendCount === 1 ? "" : "s"
            } x ${escapeHtmlForEmail(formatKr(p.confirmationFeePerWeekendKr))} = <strong>${escapeHtmlForEmail(
              formatKr(p.confirmationTotalKr)
            )}</strong></p>
          </div>`
        : ""
    }
  </div>`;

  return { plainText, htmlFragment, estimate: p };
}

/**
 * Full default plain-text body for “application accepted” emails (API + admin preview).
 */
export function buildAcceptanceEmailPlainBody({
  name,
  selectedDates,
  tableclothRental,
  termsUrl,
}) {
  const dateLabels = summarizeAcceptanceEmailDates(selectedDates);
  const datesText = dateLabels.length
    ? dateLabels.map((date) => `- ${date}`).join("\n")
    : "No dates selected";

  const { plainText: pricingPlain } = buildAcceptanceEmailPricingBlocks(
    selectedDates,
    Boolean(tableclothRental)
  );

  return `Hi ${name || "there"},

Thank you for applying to the White Lotus Summer Market.

We're happy to confirm that your application has been accepted, and we'd love to have you join us.

Your selected dates:
${datesText}

${pricingPlain}

Once the confirmation fee has been paid, your booth will be officially secured.

Bank details:
- Account no.: 0322-26-670220
- Kennitala: 670220-0440

Please reply to this email once the transfer has been made.

The remaining balance will be paid later, and we can also prepare an official invoice if you would like one.

Please read the instructions, terms, agreements, and all market information carefully here:
${termsUrl || ""}

Warmly,
White Lotus
`;
}
