import { redirect } from "next/navigation";
import { resolveEventAccess } from "@/lib/eventAccess";
import EditEvent from "@/app/events/manager/[slug]/edit/EditEvent";

// Authorise on the server: a logged-in manager/admin OR a valid manage-token
// cookie (the no-login link from /events/[slug]/manage). That cookie is scoped
// to path "/", so it's already sent here — nothing needs to be in the URL.
export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }) {
  const { slug } = await params;
  const access = await resolveEventAccess(slug, {});

  if (access.notFound) redirect("/events");
  if (!access.allowed) {
    redirect(
      access.session
        ? "/events/manager"
        : `/auth/signin?callbackUrl=${encodeURIComponent(
            `/events/manager/${slug}/edit`
          )}`
    );
  }

  return <EditEvent authorized />;
}
