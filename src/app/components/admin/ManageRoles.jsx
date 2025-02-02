"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PropagateLoader } from "react-spinners";

export default function ManageRoles() {
  const [formData, setFormData] = useState({
    email: "",
    role: "admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const roles = ["admin", "host"];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // First get the user_id from profiles table using email
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", formData.email)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("User not found");

      // Insert the role with user_id into roles table
      const { error: roleError } = await supabase.from("roles").insert([
        {
          user_id: profileData.user_id,
          role: formData.role,
        },
      ]);

      if (roleError) throw roleError;

      setSuccess(true);
      setFormData({ email: "", role: "admin" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 px-4">
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b border-gray-200 pb-4">
          Manage User Roles
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              User Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <PropagateLoader color="#ffffff" size={8} />
            ) : (
              "Assign Role"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            Role assigned successfully!
          </div>
        )}
      </div>
    </div>
  );
}
