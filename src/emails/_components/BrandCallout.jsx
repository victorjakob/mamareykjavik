// BrandCallout — soft inset card for a single highlighted message.
// Used for "Reason: card was declined" notes, important-but-quiet asides,
// security warnings, etc. A gentler version of an alert box.

import { Section } from "@react-email/components";
import { BRAND } from "./BrandLayout";
import BrandText from "./BrandText";

export default function BrandCallout({
  label,
  children,
  tone = "neutral", // neutral | warm
}) {
  const isWarm = tone === "warm";
  return (
    <Section
      style={{
        background: isWarm ? "rgba(255,145,77,0.08)" : "#faf6f2",
        border: `1px solid ${isWarm ? "rgba(255,145,77,0.28)" : BRAND.HAIRLINE}`,
        borderRadius: "12px",
        padding: "16px 20px",
        margin: "20px 0",
        textAlign: "center",
      }}
    >
      {label ? (
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "0 0 6px",
            fontSize: "10px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: isWarm ? BRAND.ORANGE : BRAND.TEXT_MUTED,
          }}
        >
          {label}
        </BrandText>
      ) : null}
      <BrandText
        align="center"
        style={{
          margin: 0,
          fontSize: "14.5px",
          color: BRAND.TEXT_DARK,
          lineHeight: 1.6,
        }}
      >
        {children}
      </BrandText>
    </Section>
  );
}
