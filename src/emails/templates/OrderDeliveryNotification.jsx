// OrderDeliveryNotification — admin-triggered: sent to a shop customer when
// their delivery order has been handed to the courier. Replaces inline HTML in
// src/app/api/admin/orders/send-delivery-email/route.js

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";

export default function OrderDeliveryNotification({
  customerName = "friend",
  shippingInfo = {},
} = {}) {
  // Strip out the contact-info keys; keep the address-y ones
  const addressEntries = Object.entries(shippingInfo || {}).filter(
    ([key]) =>
      ![
        "contactEmail",
        "contactName",
        "contact_email",
        "email",
        "email_address",
        "customer_name",
      ].includes(key),
  );

  return (
    <BrandLayout
      preview="Your Mama goodies are on their way."
      eyebrow="Mama · Shop"
    >
      <BrandHeading size="lg">Your order is on its way.</BrandHeading>

      <BrandText>Hi {customerName},</BrandText>
      <BrandText>
        Your order has been packed and is heading to the address you shared
        with us. We hope you enjoy what's inside.
      </BrandText>

      {addressEntries.length > 0 ? (
        <Section
          style={{
            background: "#faf6f2",
            border: `1px solid ${BRAND.HAIRLINE}`,
            borderRadius: "12px",
            padding: "18px 22px",
            margin: "22px 0 0",
            textAlign: "center",
          }}
        >
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
            Delivery snapshot
          </BrandText>
          {addressEntries.map(([k, v]) => (
            <BrandText
              key={k}
              align="center"
              style={{ margin: "0 0 4px", fontSize: "13.5px" }}
            >
              <span style={{ color: BRAND.TEXT_MUTED }}>
                {k.replace(/_/g, " ")}:
              </span>{" "}
              {String(v ?? "—")}
            </BrandText>
          ))}
        </Section>
      ) : null}

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "22px", fontSize: "13.5px" }}
      >
        Any questions? Just reply to this email or write to{" "}
        <a href="mailto:team@mama.is" style={{ color: BRAND.ORANGE, textDecoration: "none" }}>
          team@mama.is
        </a>
        . You can also revisit our{" "}
        <a href="https://mama.is/policies/store" style={{ color: BRAND.ORANGE, textDecoration: "none" }}>
          shop terms &amp; policies
        </a>
        .
      </BrandText>

      <BrandText style={{ marginTop: "26px" }}>With warmth,</BrandText>
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

OrderDeliveryNotification.previewProps = {
  customerName: "Anna",
  shippingInfo: {
    addressLine1: "Skólavörðustígur 18",
    postalCode: "101",
    city: "Reykjavík",
    country: "Iceland",
    phone: "+354 555 1234",
  },
};

OrderDeliveryNotification.subject = "Your Mama Reykjavik order is on its way";
