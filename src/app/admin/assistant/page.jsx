import AdminGuard from "../AdminGuard";
import AssistantPageClient from "./assistant-page-client";

export const metadata = {
  title: "Chat assistant | Admin Dashboard",
  description: "Conversations with the website AI assistant",
};

export default function AdminAssistantPage() {
  return (
    <AdminGuard>
      <AssistantPageClient />
    </AdminGuard>
  );
}
