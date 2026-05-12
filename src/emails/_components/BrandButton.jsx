// Solid orange CTA button — the only "do this now" affordance in our emails.
// Renders as a real <a> styled as a button so it works in every client (incl. Outlook).

import { Button } from "@react-email/components";
import { BRAND } from "./BrandLayout";

export default function BrandButton({
  href,
  children,
  variant = "primary", // primary | ghost
  align = "center",
  style = {},
}) {
  const isGhost = variant === "ghost";
  const buttonStyle = isGhost
    ? {
        background: "transparent",
        color: BRAND.TEXT_DARK,
        border: `1px solid ${BRAND.HAIRLINE}`,
      }
    : {
        background: BRAND.ORANGE,
        color: "#ffffff",
        border: "none",
        boxShadow: "0 2px 10px rgba(255,145,77,0.28)",
      };

  return (
    <div style={{ textAlign: align, margin: "20px 0 8px" }}>
      <Button
        href={href}
        style={{
          display: "inline-block",
          padding: "13px 26px",
          borderRadius: "999px",
          fontFamily: BRAND.fontStack.sans,
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.01em",
          textDecoration: "none",
          ...buttonStyle,
          ...style,
        }}
      >
        {children}
      </Button>
    </div>
  );
}
