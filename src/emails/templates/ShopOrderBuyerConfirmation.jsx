// ShopOrderBuyerConfirmation — sent when a shop order's payment succeeds.
// Replaces inline HTML in src/app/api/saltpay/shop/success-server/route.js
// Item rows stay left-aligned for readability; everything else is centered.

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";

function fmtIsk(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("is-IS").format(Math.round(n));
}

export default function ShopOrderBuyerConfirmation({
  contactEmail = null,
  isDelivery = false,
  items = [],
  amount = 0,
  currency = "ISK",
  shippingInfo = null,
  orderId = null,
} = {}) {
  return (
    <BrandLayout
      preview={`Thank you for your order — total ${fmtIsk(amount)} ${currency}`}
      eyebrow="Mama · Shop"
    >
      <BrandHeading size="lg">Thank you for your order.</BrandHeading>

      <BrandText>
        We've received your order and are preparing it for{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>
          {isDelivery ? "delivery" : "pickup"}
        </strong>
        . A small summary for your records below.
      </BrandText>

      {/* Order items — left-aligned rows inside a centered card */}
      <Section
        style={{
          background: "#faf6f2",
          border: `1px solid ${BRAND.HAIRLINE}`,
          borderRadius: "12px",
          padding: "8px 22px",
          margin: "22px 0 6px",
        }}
      >
        <BrandText
          tone="muted"
          align="center"
          style={{
            margin: "12px 0 12px",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: BRAND.TEXT_MUTED,
          }}
        >
          Your order
        </BrandText>

        {items.map((item, i, arr) => {
          const unit = Number(item.unitPrice || 0);
          const qty = Number(item.quantity || 0);
          const total = unit * qty;
          return (
            <div
              key={`${item.name}-${i}`}
              style={{
                padding: "10px 0",
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${BRAND.HAIRLINE}` : "none",
                display: "table",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "table-cell",
                  verticalAlign: "top",
                  textAlign: "left",
                }}
              >
                <BrandText
                  align="left"
                  style={{ margin: "0 0 2px", fontWeight: 600 }}
                >
                  {item.name}
                </BrandText>
                <BrandText
                  tone="muted"
                  align="left"
                  style={{ margin: 0, fontSize: "13px" }}
                >
                  {qty} × {fmtIsk(unit)} kr.
                </BrandText>
              </div>
              <div
                style={{
                  display: "table-cell",
                  verticalAlign: "top",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                <BrandText
                  align="left"
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: BRAND.TEXT_DARK,
                    textAlign: "right",
                  }}
                >
                  {fmtIsk(total)} kr.
                </BrandText>
              </div>
            </div>
          );
        })}
      </Section>

      <BrandDataRow
        label="Order total"
        value={`${fmtIsk(amount)} ${currency}`}
        emphasis
      />

      {/* Pickup or shipping info */}
      {isDelivery && shippingInfo ? (
        <Section style={{ margin: "22px 0 0", textAlign: "center" }}>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 8px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Shipping to
          </BrandText>
          {Object.entries(shippingInfo).map(([k, v]) => (
            <BrandText key={k} align="center" style={{ margin: "0 0 2px" }}>
              <span style={{ color: BRAND.TEXT_MUTED, fontSize: "13px" }}>
                {k}:{" "}
              </span>
              {String(v)}
            </BrandText>
          ))}
        </Section>
      ) : (
        <Section style={{ margin: "22px 0 0", textAlign: "center" }}>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 6px",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Pickup
          </BrandText>
          <BrandText align="center" style={{ margin: 0 }}>
            Ready for you at{" "}
            <strong style={{ color: BRAND.TEXT_DARK }}>
              Mama Reykjavík, Bankastræti 2
            </strong>{" "}
            during opening hours. We look forward to seeing you.
          </BrandText>
        </Section>
      )}

      {orderId ? (
        <BrandText
          tone="muted"
          align="center"
          style={{ marginTop: "20px", fontSize: "12px" }}
        >
          Order reference: <span style={{ fontFamily: '"SF Mono", Menlo, monospace' }}>{orderId}</span>
        </BrandText>
      ) : null}

      <BrandText style={{ marginTop: "24px" }}>
        Any questions, just reply to this email — we read every one.
      </BrandText>

      <BrandText style={{ marginTop: "20px" }}>With love,</BrandText>
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
    </BrandLayout>
  );
}

ShopOrderBuyerConfirmation.previewProps = {
  contactEmail: "anna@example.is",
  isDelivery: false,
  items: [
    { name: "Mama Cacao Bar — 70%", quantity: 2, unitPrice: 1490 },
    { name: "Cacao Spoon (handmade)", quantity: 1, unitPrice: 3200 },
    { name: "Mama Tea Blend No.1", quantity: 1, unitPrice: 2400 },
  ],
  amount: 8580,
  currency: "ISK",
  orderId: "MR-2026-0517-A4F2",
  shippingInfo: null,
};

ShopOrderBuyerConfirmation.subject = "Your Mama Reykjavík Order Confirmation";
