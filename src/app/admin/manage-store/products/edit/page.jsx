import { redirect } from "next/navigation";

export default function EditProductPage() {
  redirect("/admin/manage-store/products");
}
