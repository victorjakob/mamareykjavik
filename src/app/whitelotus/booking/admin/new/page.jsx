import AdminGuard from "@/app/admin/AdminGuard";
import AdminBookingForm from "../components/AdminBookingForm";

export const metadata = {
  title: "New WL Booking (Admin) | Mama",
  description: "Internal White Lotus booking intake form.",
};

export default function AdminNewBookingPage() {
  return (
    <AdminGuard>
      <AdminBookingForm mode="create" />
    </AdminGuard>
  );
}

