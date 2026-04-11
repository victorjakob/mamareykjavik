import MyProfileInfo from "@/app/profile/my-profile/MyProfileInfo";

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
        url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
        alt: "Mama Reykjavik Logo",
      },
    ],
    type: "website",
  },
};

export default function MyProfilePage() {
  return <MyProfileInfo />;
}
