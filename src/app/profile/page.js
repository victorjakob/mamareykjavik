import ProfileSelector from "@/app/components/profile/ProfileSelector";
import { createServerSupabase } from "@/lib/supabase-server";

export const metadata = {
  title: "My Profile | Mama Reykjavik",
  description:
    "Manage your profile and bookings at Mama Reykjavik. View your upcoming events and update your preferences.",
  canonical: "https://mama.is/profile",
  openGraph: {
    title: "My Profile | Mama Reykjavik",
    description:
      "Manage your profile and bookings at Mama Reykjavik. View your upcoming events and update your preferences.",
    url: "https://mama.is/profile",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        alt: "Mama Reykjavik Logo",
      },
    ],
    type: "website",
  },
};

async function getProfileData(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getRoleData(supabase, userId) {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getEventData(supabase, userEmail) {
  const { data, error } = await supabase
    .from("events")
    .select("host")
    .eq("host", userEmail);

  if (error) throw error;
  return data;
}

export default async function ProfilePage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) {
    return <ProfileSelector />;
  }

  try {
    const supabaseClient = await supabase;
    const [profileData, roleData, eventData] = await Promise.all([
      getProfileData(supabaseClient, user.id),
      getRoleData(supabaseClient, user.id),
      getEventData(supabaseClient, user.email),
    ]);

    return (
      <ProfileSelector
        serverData={{
          profileData,
          roleData,
          eventData,
        }}
      />
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return <ProfileSelector error={error} />;
  }
}
