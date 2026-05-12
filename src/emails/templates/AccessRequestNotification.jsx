// AccessRequestNotification — sent to team@mama.is when a user requests
// Event Manager / admin role. Replaces inline HTML in
// src/app/api/request-access/route.js

import BrandLayout, { BRAND } from "../_components/BrandLayout";
import BrandHeading from "../_components/BrandHeading";
import BrandText from "../_components/BrandText";
import BrandButton from "../_components/BrandButton";
import BrandDataRow from "../_components/BrandDataRow";
import BrandCallout from "../_components/BrandCallout";

export default function AccessRequestNotification({
  userEmail = "—",
  adminUrl = "https://mama.is/admin/manage-users",
} = {}) {
  return (
    <BrandLayout
      preview={`Access request — ${userEmail}`}
      eyebrow="Mama · Admin"
    >
      <BrandHeading size="lg">Access request.</BrandHeading>
      <BrandText>
        A user has requested access to the Event Manager.
      </BrandText>

      <BrandDataRow label="User" value={userEmail} mono />

      <BrandCallout label="To approve">
        Update their role in Supabase to{" "}
        <code style={{ background: "#f0e6d8", padding: "1px 6px", borderRadius: "4px", fontFamily: '"SF Mono", Menlo, monospace', fontSize: "12px" }}>host</code>{" "}
        or{" "}
        <code style={{ background: "#f0e6d8", padding: "1px 6px", borderRadius: "4px", fontFamily: '"SF Mono", Menlo, monospace', fontSize: "12px" }}>admin</code>
        .
      </BrandCallout>

      <BrandButton href={adminUrl}>Open users dashboard</BrandButton>
      <BrandButton
        href={`mailto:${userEmail}?subject=Regarding%20your%20access%20request`}
        variant="ghost"
      >
        Reply to user
      </BrandButton>
    </BrandLayout>
  );
}

AccessRequestNotification.previewProps = {
  userEmail: "kári@example.is",
  adminUrl: "https://mama.is/admin/manage-users",
};

AccessRequestNotification.subject = "Access Request: Event Manager";
