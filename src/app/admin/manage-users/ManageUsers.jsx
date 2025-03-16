"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      try {
        // Fetch users from "users" table instead of "profiles"
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
        .from("users")
        .update({ role: newRole })
        .eq("email", email);

      if (updateError) throw updateError;

      // Update local state
      setUsers(
        users.map((user) =>
          user.email === email ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-8 flex justify-center">
        <PropagateLoader color="#4F46E5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-8 px-4">
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 max-w-4xl mx-auto px-4">
      <div className=" p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b border-gray-200 pb-4">
          Manage Users
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.email, e.target.value)
                      }
                      className="text-sm text-gray-500 border rounded px-2 py-1"
                      disabled={updating}
                    >
                      <option value="user">User</option>
                      <option value="host">Host</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.email_subscription
                        ? "Subscribed"
                        : "Not Subscribed"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
