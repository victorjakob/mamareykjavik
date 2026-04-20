"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { Loader2, Users } from "lucide-react";
import {
  AdminShell,
  AdminHeader,
} from "@/app/admin/components/AdminShell";

const selectCls = `text-xs text-[#2c1810] rounded-lg px-2.5 py-1.5 transition-all
  bg-[#faf6f2] border border-[#e8ddd3]
  focus:outline-none focus:border-[#ff914d]/60
  disabled:opacity-50`;

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("name, email, email_subscription, created_at, role")
          .order("email", { ascending: true });
        if (usersError) throw usersError;
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  const handleRoleChange = async (email, newRole) => {
    setUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from("users").update({ role: newRole }).eq("email", email);
      if (updateError) throw updateError;
      setUsers(users.map((user) => user.email === email ? { ...user, role: newRole } : user));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminShell maxWidth="max-w-5xl">
        <AdminHeader
          eyebrow="Admin"
          title="Manage Users"
          subtitle="Loading users…"
        />
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 text-[#ff914d] animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell maxWidth="max-w-5xl">
        <AdminHeader
          eyebrow="Admin"
          title="Manage Users"
          subtitle="We couldn't load your users"
        />
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(255,107,107,0.08)",
            border: "1px solid rgba(255,107,107,0.2)",
          }}
        >
          <p className="text-[#ff8080] text-sm">{error}</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell maxWidth="max-w-5xl">
      <AdminHeader
        eyebrow="Admin"
        title="Manage Users"
        subtitle={`${users.length} registered ${users.length === 1 ? "user" : "users"}`}
      />

        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #e8ddd3", background: "#ffffff" }}>
                  {["Name", "Email", "Role", "Email subscription", "Joined"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9a7a62]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email} style={{ borderBottom: "1px solid #e8ddd3" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#faf6f2"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-[#ff914d]"
                          style={{ background: "rgba(255,145,77,0.14)" }}>
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-[#2c1810]">{user.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#9a7a62]">{user.email}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <select value={user.role} onChange={(e) => handleRoleChange(user.email, e.target.value)}
                        className={selectCls} disabled={updating}>
                        <option value="user">User</option>
                        <option value="host">Host</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={user.email_subscription
                          ? { background: "rgba(255,145,77,0.12)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.2)" }
                          : { background: "rgba(255,255,255,0.04)", color: "#5a4a40", border: "1px solid #2a1c0e" }
                        }>
                        {user.email_subscription ? "Subscribed" : "Not subscribed"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#5a4a40]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y" style={{ borderColor: "#e8ddd3" }}>
            {users.map((user) => (
              <div key={user.email} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-[#ff914d]"
                      style={{ background: "rgba(255,145,77,0.14)" }}>
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-[#2c1810]">{user.name || "—"}</p>
                      <p className="text-xs text-[#9a7a62]">{user.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={user.email_subscription
                      ? { background: "rgba(255,145,77,0.12)", color: "#ff914d", border: "1px solid rgba(255,145,77,0.2)" }
                      : { background: "#f3f0ec", color: "#9a7a62", border: "1px solid #e8ddd3" }
                    }>
                    {user.email_subscription ? "Subscribed" : "Not subscribed"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#9a7a62]">
                  <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                  <select value={user.role} onChange={(e) => handleRoleChange(user.email, e.target.value)}
                    className={selectCls} disabled={updating}>
                    <option value="user">User</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
    </AdminShell>
  );
}
