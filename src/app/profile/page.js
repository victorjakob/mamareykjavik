import ProfileSelector from "@/app/components/profile/ProfileSelector";

export const metadata = {
  title: "My Profile | Mama Reykjavik",
  description:
    "Manage your profile and bookings at Mama Reykjavik. View your upcoming events and update your preferences.",
  canonical: "https://mamareykjavik.is/profile",
  openGraph: {
    title: "My Profile | Mama Reykjavik",
    description:
      "Manage your profile and bookings at Mama Reykjavik. View your upcoming events and update your preferences.",
    url: "https://mamareykjavik.is/profile",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        alt: "Mama Reykjavik Logo",
      },
    ],
    type: "website",
  },
};

export default function ProfilePage() {
  return <ProfileSelector />;
}
