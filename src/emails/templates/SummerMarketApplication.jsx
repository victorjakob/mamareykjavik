// SummerMarketApplication — sent to team@mama.is when a vendor submits an
// application for the Summer Market. Replaces buildEmailHtml in
// src/app/api/summer-market/apply/route.js

import { Section } from "@react-email/components";
import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";

const SECTION_LABEL_STYLE = {
  margin: "0 0 8px",
  fontSize: "10px",
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  fontWeight: 700,
};

export default function SummerMarketApplication({
  brandName = "—",
  contactPerson = "—",
  email = "—",
  phoneWhatsapp = "—",
  whatDoYouSell = null,
  productCategory = [],
  instagramOrWebsite = null,
  month = null,
  preferredDates = [],
  needsPower = "No",
  tableclothRental = "No",
  setupNotes = null,
  anythingElse = null,
  instagramShare = false,
  photoUrls = [],
  adminUrl = "https://mama.is/admin/summer-market",
} = {}) {
  return (
    <BrandLayout
      preview={`Summer Market application from ${brandName}.`}
      eyebrow="White Lotus · Summer Market"
    >
      <BrandHeading size="lg">New application.</BrandHeading>

      {/* Brand banner */}
      <Section style={{ margin: "20px 0", textAlign: "center" }}>
        <BrandText
          tone="muted"
          align="center"
          style={{ ...SECTION_LABEL_STYLE, color: BRAND.ORANGE }}
        >
          Applicant
        </BrandText>
        <BrandText
          align="center"
          style={{
            margin: 0,
            fontFamily: BRAND.fontStack.serif,
            fontStyle: "italic",
            fontSize: "24px",
            color: BRAND.TEXT_DARK,
          }}
        >
          {brandName}
        </BrandText>
        <BrandText
          tone="muted"
          align="center"
          style={{ margin: "4px 0 0", fontSize: "13px" }}
        >
          {contactPerson} · <a href={`mailto:${email}`} style={{ color: BRAND.ORANGE, textDecoration: "none" }}>{email}</a> · {phoneWhatsapp}
        </BrandText>
      </Section>

      <BrandButton href={adminUrl}>Open Summer Market manager</BrandButton>

      {/* About products */}
      <Section style={{ margin: "26px 0 0", textAlign: "center" }}>
        <BrandText tone="muted" align="center" style={SECTION_LABEL_STYLE}>
          About the products
        </BrandText>
      </Section>
      {whatDoYouSell ? (
        <BrandDataRow label="What they sell" value={whatDoYouSell} />
      ) : null}
      {productCategory.length > 0 ? (
        <BrandDataRow label="Categories" value={productCategory.join(" · ")} />
      ) : null}
      {instagramOrWebsite ? (
        <BrandDataRow label="Instagram / website" value={instagramOrWebsite} mono />
      ) : null}

      {/* Dates */}
      <Section style={{ margin: "20px 0 0", textAlign: "center" }}>
        <BrandText tone="muted" align="center" style={SECTION_LABEL_STYLE}>
          Dates
        </BrandText>
      </Section>
      {month ? <BrandDataRow label="Month" value={month} /> : null}
      {preferredDates.length > 0 ? (
        <BrandDataRow label="Selected dates" value={preferredDates.join(", ")} />
      ) : null}

      {/* Setup */}
      <Section style={{ margin: "20px 0 0", textAlign: "center" }}>
        <BrandText tone="muted" align="center" style={SECTION_LABEL_STYLE}>
          Setup
        </BrandText>
      </Section>
      <BrandDataRow label="Needs power" value={needsPower === "Yes" ? "Yes" : "No"} />
      <BrandDataRow label="Tablecloth rental" value={tableclothRental === "Yes" ? "Yes" : "No"} />
      {setupNotes ? <BrandDataRow label="Setup notes" value={setupNotes} /> : null}

      {/* Optional */}
      {anythingElse ? (
        <>
          <Section style={{ margin: "20px 0 0", textAlign: "center" }}>
            <BrandText tone="muted" align="center" style={SECTION_LABEL_STYLE}>
              Anything else
            </BrandText>
          </Section>
          <BrandDataRow label="Note" value={anythingElse} />
        </>
      ) : null}

      <BrandDataRow label="Instagram share" value={instagramShare ? "Yes" : "No"} />

      {/* Photos */}
      {photoUrls.length > 0 ? (
        <Section style={{ margin: "26px 0 0" }}>
          <BrandText
            tone="muted"
            align="center"
            style={SECTION_LABEL_STYLE}
          >
            Photos ({photoUrls.length})
          </BrandText>
          <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: "10px" }}>
            <tbody>
              <tr>
                {photoUrls.map((url, i) => (
                  <td key={i} style={{ padding: "6px", width: `${100 / Math.min(photoUrls.length, 3)}%` }}>
                    <a href={url} style={{ display: "block" }}>
                      <img
                        src={url}
                        alt={`Photo ${i + 1}`}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          display: "block",
                          border: `1px solid ${BRAND.HAIRLINE}`,
                        }}
                      />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Section>
      ) : null}
    </BrandLayout>
  );
}

SummerMarketApplication.previewProps = {
  brandName: "Norð Ceramics",
  contactPerson: "Hera Björk",
  email: "hera@nordceramics.is",
  phoneWhatsapp: "+354 555 1234",
  whatDoYouSell: "Hand-thrown stoneware mugs, plates, and small vases. Mostly natural stoneware glazes.",
  productCategory: ["Ceramics", "Home goods"],
  instagramOrWebsite: "@nordceramics",
  month: "July 2026",
  preferredDates: ["Sat 5 Jul", "Sat 19 Jul"],
  needsPower: "Yes",
  tableclothRental: "No",
  setupNotes: "I bring my own table (1.6m). Just need a corner with one outlet.",
  anythingElse: "Happy to demo wheel throwing in the afternoon if there's interest.",
  instagramShare: true,
  photoUrls: [
    "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=400&q=80",
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80",
  ],
  adminUrl: "https://mama.is/admin/summer-market",
};

SummerMarketApplication.subject = "Summer Market application — Norð Ceramics";
