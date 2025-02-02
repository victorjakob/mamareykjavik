"use client";

import ManageRoles from "@/app/components/admin/ManageRoles";
import ManageUsers from "@/app/components/admin/ManageUsers";

export default function ManageUsersPage() {
  return (
    <div>
      <ManageRoles />
      <ManageUsers />
    </div>
  );
}
