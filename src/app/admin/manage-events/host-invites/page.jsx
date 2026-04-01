import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import HostInviteGeneratorClient from "./HostInviteGeneratorClient";

export const dynamic = "force-dynamic";

export default async function HostInvitesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth?callbackUrl=%2Fadmin%2Fmanage-events%2Fhost-invites");
  }

  if (session.user.role !== "admin") {
    redirect("/admin/manage-events");
  }

  return <HostInviteGeneratorClient />;
}
