// ShopOrderAdminNotification — sent to team@mama.is when a shop order's
// payment succeeds. Replaces inline HTML in
// src/app/api/saltpay/shop/success-server/route.js (admin email).

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

function fmtIsk(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("is-IS").format(Math.round(n));
}

export default function ShopOrderAdminNotification({
  contactEmail = null,
  isDelivery = false,
  items = [],
  amount = 0,
  currency = "ISK",
  shippingInfo = null,
  orderId = null,
  adminUrl = "https://mama.is/admin/manage-store/orders",
} = {}) {
  return (
    <BrandLayout
      preview={`New shop order — ${fmtIsk(amount)} ${currency}`}
      eyebrow="Mama · Shop Admin"
    >
      <BrandHeading size="lg">New order received.</BrandHeading>
      <BrandText>
        From{" "}
        <strong style={{ color: BRAND.TEXT_DARK }}>
          {contactEmail || "Guest checkout"}
        </strong>
        .
      </BrandText>

      <BrandDataRow
        label="Order total"
        value={`${fmtIsk(amount)} ${currency}`}
        emphasis
      />
      {orderId ? <BrandDataRow label="Order ID" value={orderId} mono /> : null}
      <BrandDataRow label="Fulfilment" value={isDelivery ? "Delivery" : "Pickup"} />

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
          }}
        >
          Items
        </BrandText>
        {items.map((item, i, arr) => {
          const unit = Number(item.unitPrice || 0);
          const qty = Number(item.quantity || 0);
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
              <div style={{ display: "table-cell", textAlign: "left" }}>
                <BrandText align="left" style={{ margin: "0 0 2px", fontWeight: 600 }}>
                  {item.name}
                </BrandText>
                <BrandText tone="muted" align="left" style={{ margin: 0, fontSize: "13px" }}>
                  {qty} × {fmtIsk(unit)} kr.
                </BrandText>
              </div>
              <div style={{ display: "table-cell", textAlign: "right" }}>
                <BrandText
                  align="left"
                  style={{ margin: 0, fontWeight: 600, color: BRAND.TEXT_DARK, textAlign: "right" }}
                >
                  {fmtIsk(unit * qty)} kr.
                </BrandText>
              </div>
            </div>
          );
        })}
      </Section>

      {isDelivery && shippingInfo ? (
        <Section style={{ margin: "20px 0 0", textAlign: "center" }}>
          <BrandText
            tone="muted"
            align="center"
            style={{
              margin: "0 0 6px",
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Shipping to
          </BrandText>
          {Object.entries(shippingInfo).map(([k, v]) => (
            <BrandText key={k} align="center" style={{ margin: "0 0 2px", fontSize: "13.5px" }}>
              <span style={{ color: BRAND.TEXT_MUTED }}>{k}: </span>
              {String(v)}
            </BrandText>
          ))}
        </Section>
      ) : null}

      <BrandButton href={adminUrl}>Open orders dashboard</BrandButton>
    </BrandLayout>
  );
}

ShopOrderAdminNotification.previewProps = {
  contactEmail: "anna@example.is",
  isDelivery: false,
  items: [
    { name: "Mama Cacao Bar — 70%", quantity: 2, unitPrice: 1490 },
    { name: "Cacao Spoon (handmade)", quantity: 1, unitPrice: 3200 },
  ],
  amount: 6180,
  currency: "ISK",
  orderId: "MR-2026-0517-A4F2",
  adminUrl: "https://mama.is/admin/manage-store/orders",
};

ShopOrderAdminNotification.subject = "New Order: MR-2026-0517-A4F2";
