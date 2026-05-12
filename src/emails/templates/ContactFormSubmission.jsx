// ContactFormSubmission — sent to team@mama.is when someone submits the
// general contact form. Replaces inline HTML in
// src/app/api/sendgrid/contact-form/route.js

import BrandLayout from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

export default function ContactFormSubmission({
  name = "—",
  email = "—",
  message = "",
  source = "website",
} = {}) {
  const messageSource = (source || "").trim() || "website";
  return (
    <BrandLayout
      preview={`New message from ${name} via ${messageSource}.`}
      eyebrow="Mama · Admin"
    >
      <BrandHeading size="lg">New message.</BrandHeading>
      <BrandText>Reply to this email to reach {name} directly.</BrandText>

      <BrandDataRow label="Name" value={name} />
      <BrandDataRow label="Email" value={email} mono />
      <BrandDataRow label="Source" value={messageSource} />

      <BrandCallout label="Their message">
        {message || "(no message provided)"}
      </BrandCallout>
    </BrandLayout>
  );
}

ContactFormSubmission.previewProps = {
  name: "Anna Sigurðardóttir",
  email: "anna@example.is",
  message:
    "Hi! I'd love to know whether the back room is available for a small private gathering on a Saturday in June. Around 18 guests. Thanks so much!",
  source: "Contact page",
};

ContactFormSubmission.subject = "New message from Contact page";
