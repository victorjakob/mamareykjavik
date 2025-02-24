import MyProfileInfo from "@/app/components/profile/MyProfileInfo";

export const metadata = {
  title: "My Profile | Mama Reykjavik",
  description:
    "View and manage your profile settings and preferences for Mama Reykjavik.",
  canonical: "https://mama.is/profile/my-profile",
  openGraph: {
    title: "My Profile | Mama Reykjavik",
    description: "Manage your Mama Reykjavik profile settings and preferences.",
    url: "https://mama.is/profile/my-profile",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        alt: "Mama Reykjavik Logo",
      },
    ],
    type: "website",
  },
};

export default function MyProfilePage() {
  return <MyProfileInfo />;
}
