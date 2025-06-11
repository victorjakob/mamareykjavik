import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const metadata = {
  title: "Members Only | Mama Reykjavik",
  description:
    "Exclusive content for registered members of Mama Reykjavik.",
};

export default async function MembersOnlyPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  const userName = session.user.name || session.user.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white py-20">
      <div className="max-w-xl bg-white rounded-3xl shadow-lg p-12 text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Welcome, {userName}</h1>
        <p className="text-gray-600 text-lg">
          This hidden page is only visible to logged in members.
        </p>
      </div>
    </div>
  );
}
