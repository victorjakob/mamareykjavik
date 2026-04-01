import { Suspense } from "react";
import CompleteHostInviteClient from "./CompleteHostInviteClient";

export const dynamic = "force-dynamic";

export default function CompleteHostInvitePage() {
  return (
    <Suspense fallback={null}>
      <CompleteHostInviteClient />
    </Suspense>
  );
}
