// Cormorant-italic heading — the Mama signature.
// Used at the top of every email body, plus as section headers in the newsletter.

import { Heading } from "@react-email/components";
import { BRAND } from "./BrandLayout";

export default function BrandHeading({
  children,
  size = "lg", // sm | md | lg
  align = "center", // brand default; pass align="left" for structured cards
  as = "h1",
  style = {},
}) {
  const sizeMap = {
    sm: "20px",
    md: "26px",
    lg: "34px",
  };
  return (
    <Heading
      as={as}
      style={{
        margin: "0 0 16px",
        fontFamily: BRAND.fontStack.serif,
        fontSize: sizeMap[size] || sizeMap.lg,
        fontStyle: "italic",
        fontWeight: 400,
        color: BRAND.TEXT_DARK,
        lineHeight: 1.15,
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </Heading>
  );
}
