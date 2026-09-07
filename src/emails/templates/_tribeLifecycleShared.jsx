// Shared bits for the tribe-card lifecycle emails (expiring / expired /
// follow-up / invite). Not a template itself — no manifest entry.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandText from "../_components/BrandText";

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Practical note that lives in every one of these emails: the membership
// signup asks people to sign in, and the card only "finds" its owner when
// the same email address is used.
export function SameEmailNote({ style = {} }) {
  return (
    <BrandText tone="muted" style={{ fontSize: "13px", ...style }}>
      One small thing: when you join, sign in with this same email address —
      that&apos;s how your card and your membership find each other, so you
      keep the card you already have in your wallet.
    </BrandText>
  );
}

export function SignOff() {
  return (
    <>
      <BrandText style={{ marginTop: "26px" }}>With love,</BrandText>
      <BrandText
        style={{
          fontFamily: BRAND.fontStack.serif,
          fontStyle: "italic",
          fontSize: "18px",
          margin: "-8px 0 0",
        }}
      >
        The Mama team
      </BrandText>
    </>
  );
}

export { BrandLayout, BRAND };
