// Body paragraph for Mama emails. Comfortable line-height, warm espresso colour.
// Use `tone="muted"` for secondary lines, `tone="quiet"` for tiny captions.

import { Text } from "@react-email/components";
import { BRAND } from "./BrandLayout";

export default function BrandText({
  children,
  tone = "default", // default | muted | quiet
  align = "center", // brand default; pass align="left" for bullet lists, event rows, etc.
  style = {},
}) {
  const colorMap = {
    default: BRAND.TEXT_DARK,
    muted: BRAND.TEXT_MUTED,
    quiet: BRAND.TEXT_MUTED,
  };
  const sizeMap = {
    default: "15px",
    muted: "14px",
    quiet: "12px",
  };
  return (
    <Text
      style={{
        margin: "0 0 14px",
        fontFamily: BRAND.fontStack.sans,
        fontSize: sizeMap[tone] || sizeMap.default,
        lineHeight: 1.65,
        color: colorMap[tone] || colorMap.default,
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </Text>
  );
}
