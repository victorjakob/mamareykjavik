// Keep this as a server component
import ProfileSelector from "./ProfileSelector";

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
        url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
        alt: "Mama Reykjavik Logo",
      },
    ],
    type: "website",
  },
};

export default function ProfilePage() {
  return <ProfileSelector />;
}
