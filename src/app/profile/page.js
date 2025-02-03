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
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Logo%20bigger.jpeg?alt=media&token=704baa9f-90bd-47f2-900c-0ab8535eed0b",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik Profile",
      },
    ],
    type: "website",
  },
};

export default function ProfilePage() {
  return <ProfileSelector />;
}
