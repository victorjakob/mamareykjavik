import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyHostInviteToken } from "@/lib/hostInvites";

export const dynamic = "force-dynamic";

export default async function HostInvitePage({ searchParams }) {
  const params = await searchParams;
  const token = params?.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">Invalid invite</h1>
          <p className="mt-3 text-gray-600">
            This host invite link is missing its token. Please ask Mama to send you a
            fresh invite.
          </p>
        </div>
      </div>
    );
  }

  let invite;
  try {
    invite = verifyHostInviteToken(token);
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">Invite expired</h1>
          <p className="mt-3 text-gray-600">
            This host invite link is no longer valid. Please ask Mama for a new
            invite link.
          </p>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    redirect(`/host-invite/complete?token=${encodeURIComponent(token)}`);
  }

  const callbackTarget = `/host-invite/complete?token=${encodeURIComponent(token)}`;
  const callbackUrl = encodeURIComponent(callbackTarget);
  const invitedEmail = encodeURIComponent(invite.email);

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto mt-20 max-w-3xl rounded-[2rem] border border-gray-100 bg-gradient-to-br from-white via-white to-orange-50 p-8 shadow-sm sm:p-12">
        <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
          White Lotus host onboarding
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
          You&apos;ve been invited to host an event
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Log in or create your account with <strong>{invite.email}</strong>. Once
          you&apos;re in, we&apos;ll automatically grant host access and take you
          straight to the event creation page.
        </p>

        <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
          <p className="text-sm font-medium text-orange-900">
            Important: use the invited email address
          </p>
          <p className="mt-2 text-sm text-orange-800/80">
            This invite is tied to <strong>{invite.email}</strong>. If you sign in
            or register with a different email, we won&apos;t be able to apply the
            host access.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/auth?mode=login&callbackUrl=${callbackUrl}&email=${invitedEmail}`}
            className="inline-flex items-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Log in and continue
          </Link>
          <Link
            href={`/auth?mode=signup&callbackUrl=${callbackUrl}&email=${invitedEmail}`}
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Create account and continue
          </Link>
        </div>
      </div>
    </main>
  );
}
