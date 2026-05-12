// WlReviewSubmission — sent to team@mama.is when a customer submits or
// updates a White Lotus review. Replaces inline HTML in
// src/app/api/wl/review/route.js (sendReviewEmail).

import BrandLayout from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

function stars(n) {
  return Number.isInteger(n) ? `${n}/5` : null;
}
function score(n) {
  return Number.isInteger(n) ? `${n}/10` : null;
}

export default function WlReviewSubmission({
  kind = "submitted", // submitted | updated
  reviewId = "—",
  overall = 5,
  recommend = 9,
  segment = "high",
  locale = "en",
  bookingComm = null,
  staffService = null,
  cleanliness = null,
  ambience = null,
  tech = null,
  flow = null,
  value = null,
  improve = null,
  bestPart = null,
  lowSatisfactionDetails = null,
  followUpName = null,
  followUpContact = null,
  adminUrl = "https://mama.is/admin/reviews",
} = {}) {
  return (
    <BrandLayout
      preview={`Review ${kind}: ${overall}★, ${recommend}/10`}
      eyebrow="White Lotus · Admin"
    >
      <BrandHeading size="lg">
        {kind === "submitted" ? "New review." : "Review updated."}
      </BrandHeading>
      <BrandText>
        A White Lotus review was {kind}. Headline numbers below.
      </BrandText>

      <BrandDataRow label="Overall" value={`${overall}★`} emphasis />
      <BrandDataRow label="Would recommend" value={`${recommend}/10`} />
      <BrandDataRow label="Segment" value={segment} />
      <BrandDataRow label="Locale" value={locale} />

      {bookingComm || staffService || cleanliness ? (
        <>
          {bookingComm ? <BrandDataRow label="Booking & comms" value={stars(bookingComm)} /> : null}
          {staffService ? <BrandDataRow label="Staff service" value={stars(staffService)} /> : null}
          {cleanliness ? <BrandDataRow label="Cleanliness" value={stars(cleanliness)} /> : null}
        </>
      ) : null}

      {ambience || tech || flow || value ? (
        <>
          {ambience ? <BrandDataRow label="Ambience / vibe" value={stars(ambience)} /> : null}
          {tech ? <BrandDataRow label="Tech & equipment" value={stars(tech)} /> : null}
          {flow ? <BrandDataRow label="Flow on the day" value={stars(flow)} /> : null}
          {value ? <BrandDataRow label="Value for money" value={stars(value)} /> : null}
        </>
      ) : null}

      {improve ? <BrandCallout label="Improve">{improve}</BrandCallout> : null}
      {bestPart ? <BrandCallout label="Best part">{bestPart}</BrandCallout> : null}
      {lowSatisfactionDetails ? (
        <BrandCallout label="What went wrong" tone="warm">
          {lowSatisfactionDetails}
        </BrandCallout>
      ) : null}
      {followUpName || followUpContact ? (
        <BrandCallout label="Follow-up requested">
          {followUpName || ""}
          {followUpName && followUpContact ? " · " : ""}
          {followUpContact || ""}
        </BrandCallout>
      ) : null}

      <BrandButton href={adminUrl}>Open admin reviews</BrandButton>

      <BrandText
        tone="muted"
        align="center"
        style={{ marginTop: "20px", fontSize: "11.5px", fontFamily: '"SF Mono", Menlo, monospace' }}
      >
        Review ID: {reviewId}
      </BrandText>
    </BrandLayout>
  );
}

WlReviewSubmission.previewProps = {
  kind: "submitted",
  reviewId: "rev_2J5K7N9P2Q",
  overall: 5,
  recommend: 9,
  segment: "high",
  locale: "en",
  bookingComm: 5,
  staffService: 5,
  cleanliness: 5,
  ambience: 5,
  flow: 4,
  value: 4,
  improve: "More signage at the entrance — first-time guests struggled to find the door.",
  bestPart: "The way the team made everyone feel held without being pushy.",
  adminUrl: "https://mama.is/admin/reviews",
};

WlReviewSubmission.subject = "New White Lotus review: 5★, 9/10";
