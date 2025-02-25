"use client";

import { useEffect, useState } from "react";
import { PropagateLoader } from "react-spinners";
import { UserCircle, Mail, Bell, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/SupabaseProvider";

export default function ProfileInfo() {
  const router = useRouter();
  const {
    user: authUser,
    supabase,
    signOut,
    profile,
    loading: contextLoading,
  } = useSupabase();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (profile?.name) {
      setEditedName(profile.name);
    }
  }, [profile]);

  const handleSaveChanges = async () => {
    if (!editedName.trim()) return;

    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: editedName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", authUser.id);

      if (profileError) throw profileError;

      setProfile((prev) => ({
        ...prev,
        name: editedName.trim(),
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSubscription = async () => {
    setSaving(true);
    try {
      const newSubscriptionStatus = !profile.email_subscription;
      const { error } = await supabase
        .from("profiles")
        .update({
          email_subscription: newSubscriptionStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", authUser.id);

      if (error) throw error;

      setProfile((prev) => ({
        ...prev,
        email_subscription: newSubscriptionStatus,
      }));
    } catch (err) {
      console.error("Error updating subscription:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    if (passwords.new !== passwords.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      setIsChangingPassword(false);
      setPasswords({ new: "", confirm: "" });
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err.message);
    }
  };

  if (contextLoading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        role="status"
      >
        <PropagateLoader color="#F97316" size={12} aria-label="Loading" />
      </div>
    );
  }

  if (error || !authUser || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? "Error loading profile" : "Profile not found"}
          </h1>
          {error && <p className="text-red-500 mb-6">{error}</p>}
          <Link
            href="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-700"
            aria-label="Return to Home"
          >
            <ChevronLeft className="w-5 h-5 mr-1" aria-hidden="true" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-8 py-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-full">
                <UserCircle
                  className="w-12 h-12 text-white"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Account Settings
                </h1>
                <p className="text-orange-100 mt-1">
                  Manage your profile and preferences
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8">
            {/* Display Name Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <UserCircle className="w-5 h-5" aria-hidden="true" />
                <h2 className="text-lg font-medium">Display Name</h2>
              </div>

              {isEditing ? (
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your name"
                    maxLength={50}
                    aria-label="Display name"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveChanges}
                      disabled={saving || !editedName.trim()}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                      aria-label={saving ? "Saving changes" : "Save changes"}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(profile.name);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      aria-label="Cancel editing"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{profile.name}</span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                    aria-label="Edit display name"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Email Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <Mail className="w-5 h-5" aria-hidden="true" />
                <h2 className="text-lg font-medium">Email Address</h2>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-900">{authUser.email}</span>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <Lock className="w-5 h-5" aria-hidden="true" />
                <h2 className="text-lg font-medium">Password</h2>
              </div>
              {isChangingPassword ? (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          new: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="New password"
                    />
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          confirm: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-red-500 text-sm">{passwordError}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePasswordChange}
                      disabled={saving || !passwords.new || !passwords.confirm}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Saving..." : "Update Password"}
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswords({ new: "", confirm: "" });
                        setPasswordError("");
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">••••••••</span>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Change Password
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <Bell className="w-5 h-5" aria-hidden="true" />
                <h2 className="text-lg font-medium">Notifications</h2>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.email_subscription || false}
                    onChange={handleToggleSubscription}
                    disabled={saving}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    aria-label="Toggle email notifications"
                  />
                  <span className="text-gray-900">
                    Receive email newsletters and special offers
                  </span>
                </label>
                {saving && (
                  <span className="text-sm text-gray-500" aria-live="polite">
                    Saving...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
