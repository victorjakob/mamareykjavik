// PasswordReset — sent when a user requests a password reset link.
// Quiet, functional, on-brand. The CTA is the only orange element.
// One-hour link expiry is mentioned so the user understands the urgency
// without us shouting about security.

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";

export default function PasswordReset({
  resetLink = "https://mama.is/auth/reset-password?token=example",
  expiresInHours = 24,
} = {}) {
  return (
    <BrandLayout
      preview="Reset your Mama account password — link expires soon."
      eyebrow="Mama · Account"
    >
      <BrandHeading size="lg">Reset your password.</BrandHeading>

      <BrandText>
        We received a request to reset the password for your Mama account.
        Tap the button below to choose a new one.
      </BrandText>

      <BrandButton href={resetLink}>Reset my password</BrandButton>

      <BrandText
        tone="muted"
        style={{
          marginTop: "8px",
          fontSize: "13px",
        }}
      >
        This link will expire in {expiresInHours} hours, so it's best to use
        it soon.
      </BrandText>

      <BrandText
        tone="muted"
        style={{
          marginTop: "20px",
          fontSize: "13px",
          paddingTop: "16px",
          borderTop: `1px solid ${BRAND.HAIRLINE}`,
        }}
      >
        If you didn't request this, no action is needed — your password
        won't change. You can safely ignore this email.
      </BrandText>

      <BrandText style={{ marginTop: "24px" }}>With care,</BrandText>
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

PasswordReset.previewProps = {
  resetLink: "https://mama.is/auth/reset-password?token=preview-token-abc123",
  expiresInHours: 24,
};

PasswordReset.subject = "Reset your Mama password";
