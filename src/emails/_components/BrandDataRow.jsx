// BrandDataRow — small uppercase label above a value, centered by default.
// Used for receipts, confirmations, and any structured data display where
// a key/value table would feel too "spreadsheet" for the brand.
//
// <BrandDataRow label="Tier" value="Tribe" />
// <BrandDataRow label="Receipt" value="abc123" mono />

import { Section } from "@react-email/components";
import { BRAND } from "./BrandLayout";
import BrandText from "./BrandText";

export default function BrandDataRow({
  label,
  value,
  mono = false,
  emphasis = false, // bumps the value larger (e.g. for the headline amount)
}) {
  return (
    <Section style={{ margin: "16px 0" }}>
      <BrandText
        tone="muted"
        align="center"
        style={{
          margin: "0 0 4px",
          fontSize: "10px",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: BRAND.TEXT_MUTED,
        }}
      >
        {label}
      </BrandText>
      <BrandText
        align="center"
        style={{
          margin: 0,
          fontFamily: mono
            ? '"SF Mono", Menlo, Consolas, monospace'
            : BRAND.fontStack.sans,
          fontSize: emphasis ? "22px" : mono ? "13px" : "16px",
          fontWeight: emphasis ? 600 : mono ? 400 : 500,
          color: BRAND.TEXT_DARK,
          letterSpacing: emphasis ? "0.01em" : "normal",
        }}
      >
        {value}
      </BrandText>
    </Section>
  );
}
