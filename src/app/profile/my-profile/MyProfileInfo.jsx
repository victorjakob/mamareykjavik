"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserCircle, Mail, Bell, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/util/supabase/client";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import PageBackground from "@/app/components/ui/PageBackground";
import ProfileHero from "@/app/profile/components/ProfileHero";
import { motion } from "framer-motion";

const ACCENT = "#ff914d";

function SettingsCard({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07), 0 0 0 1px rgba(60,30,10,0.03)",
      }}
    >
      {/* Subtle orange wash */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-50"
        style={{
          background: "radial-gradient(ellipse 90% 120% at 100% 50%, rgba(255,145,77,0.05) 0%, transparent 55%)",
        }}
        aria-hidden
      />
      {/* Left accent bar */}
      <div
        className="pointer-events-none absolute left-0 top-1/2 z-[2] h-[68%] w-[3px] -translate-y-1/2 rounded-full opacity-50"
        style={{ background: `linear-gradient(180deg, ${ACCENT} 0%, transparent 92%)` }}
        aria-hidden
      />
      <div className="relative z-[2]">{children}</div>
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2.5 mb-4" style={{ color: "#ff914d" }}>
      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.25} />
      <span className="text-xs uppercase tracking-[0.32em]">{label}</span>
    </div>
  );
}

export default function ProfileInfo({ inline = false, onBack }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (session?.user?.id) {
        try {
          const { data, error: supaError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (supaError) throw supaError;
          setProfile(data);
        } catch (err) {
          console.error("Error loading profile:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    }
    loadProfile();
  }, [session]);

  useEffect(() => {
    if (profile?.name) setEditedName(profile.name);
  }, [profile]);

  const handleSaveChanges = async () => {
    if (!editedName.trim()) return;
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("users")
        .update({ name: editedName.trim(), updated_at: new Date().toISOString() })
        .eq("id", session.user.id);
      if (profileError) throw profileError;
      setProfile((prev) => ({ ...prev, name: editedName.trim() }));
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
      const newStatus = !profile.email_subscription;
      const { error: supaError } = await supabase
        .from("users")
        .update({ email_subscription: newStatus, updated_at: new Date().toISOString() })
        .eq("id", session.user.id);
      if (supaError) throw supaError;
      setProfile((prev) => ({ ...prev, email_subscription: newStatus }));
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
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setIsChangingPassword(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const firstName =
    profile?.name?.split(" ")[0] ||
    session?.user?.name?.split(" ")[0] ||
    session?.user?.email?.split("@")[0] ||
    "?";

  const inputClass =
    "w-full bg-[#faf6f2] border border-[#e8ddd3] text-[#2c1810] text-base rounded-xl px-4 py-3 placeholder:text-[#c0a890] focus:outline-none focus:border-[#ff914d]/60 transition-colors";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (status === "loading" || loading) {
    if (inline) return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
    return (
      <div className="min-h-screen relative">
        <PageBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // ── Error / no session ───────────────────────────────────────────────────────
  if (!session || error || !profile) {
    if (inline) return (
      <div className="py-12 px-5 text-center">
        <p className="text-[#9a7a62] text-sm">{error || "Profile not found"}</p>
        <button onClick={onBack} className="mt-4 text-[#ff914d] text-sm hover:underline">← Back</button>
      </div>
    );
    return (
      <div className="min-h-screen relative">
        <PageBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <h1 className="font-cormorant font-light italic text-[#2c1810] text-3xl mb-3">
              {error ? "Error loading profile" : "Profile not found"}
            </h1>
            {error && <p className="text-red-500 text-sm mb-5">{error}</p>}
            <Link
              href="/"
              className="inline-flex items-center text-[#ff914d] hover:text-[#e07a3a] text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Return to Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Main content ─────────────────────────────────────────────────────────────
  const content = (
    <div className="relative mx-auto max-w-sm px-5 pb-16 pt-6 sm:max-w-xl lg:max-w-6xl xl:max-w-7xl lg:px-10">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {inline ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm transition-colors mb-8"
            style={{ color: "#9a7a62" }}
            onMouseEnter={e => e.currentTarget.style.color = "#6b4e37"}
            onMouseLeave={e => e.currentTarget.style.color = "#9a7a62"}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </button>
        ) : (
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm transition-colors mb-8"
            style={{ color: "#9a7a62" }}
            onMouseEnter={e => e.currentTarget.style.color = "#6b4e37"}
            onMouseLeave={e => e.currentTarget.style.color = "#9a7a62"}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        )}
      </motion.div>

      {/* Cards — two columns on large screens */}
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">

        {/* Display Name */}
        <SettingsCard delay={0.08}>
          <div className="px-5 py-5 sm:px-6">
            <SectionHeader icon={UserCircle} label="Display Name" />
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter your name"
                  maxLength={50}
                  aria-label="Display name"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={saving || !editedName.trim()}
                    className="flex-1 py-2.5 text-white text-base font-semibold rounded-full disabled:opacity-50 transition-colors"
                    style={{ background: "#ff914d" }}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setEditedName(profile.name); }}
                    className="flex-1 py-2.5 rounded-full text-base transition-colors"
                    style={{ border: "1.5px solid #e8ddd3", color: "#9a7a62" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3.5"
                style={{ background: "#faf6f2", border: "1.5px solid #ede5db" }}>
                <span className="text-base" style={{ color: "#2c1810" }}>{profile.name}</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-medium transition-colors flex-shrink-0"
                  style={{ color: "#ff914d" }}
                  aria-label="Edit display name"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </SettingsCard>

        {/* Email */}
        <SettingsCard delay={0.14}>
          <div className="px-5 py-5 sm:px-6">
            <SectionHeader icon={Mail} label="Email Address" />
            <div className="rounded-xl px-4 py-3.5"
              style={{ background: "#faf6f2", border: "1.5px solid #ede5db" }}>
              <span className="text-base" style={{ color: "#9a7a62" }}>{session.user.email}</span>
            </div>
          </div>
        </SettingsCard>

        {/* Password */}
        <SettingsCard delay={0.2}>
          <div className="px-5 py-5 sm:px-6">
            <SectionHeader icon={Lock} label="Password" />
            {isChangingPassword ? (
              <div className="space-y-3">
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  className={inputClass}
                  placeholder="Current password"
                />
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
                  className={inputClass}
                  placeholder="New password"
                />
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  className={inputClass}
                  placeholder="Confirm new password"
                />
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={saving || !passwords.current || !passwords.new || !passwords.confirm}
                    className="flex-1 py-2.5 text-white text-base font-semibold rounded-full disabled:opacity-50 transition-colors"
                    style={{ background: "#ff914d" }}
                  >
                    {saving ? "Saving…" : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswords({ current: "", new: "", confirm: "" });
                      setPasswordError("");
                    }}
                    className="flex-1 py-2.5 rounded-full text-base transition-colors"
                    style={{ border: "1.5px solid #e8ddd3", color: "#9a7a62" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3.5"
                style={{ background: "#faf6f2", border: "1.5px solid #ede5db" }}>
                <span className="text-base tracking-[0.25em]" style={{ color: "#c0a890" }}>••••••••</span>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="text-sm font-medium transition-colors flex-shrink-0"
                  style={{ color: "#ff914d" }}
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard delay={0.26}>
          <div className="px-5 py-5 sm:px-6">
            <SectionHeader icon={Bell} label="Notifications" />
            <div className="rounded-xl px-4 py-4"
              style={{ background: "#faf6f2", border: "1.5px solid #ede5db" }}>
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <span className="text-base leading-snug" style={{ color: "#9a7a62" }}>
                  Receive email newsletters and special offers
                </span>
                <button
                  type="button"
                  onClick={!saving ? handleToggleSubscription : undefined}
                  disabled={saving}
                  className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                    saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  style={{ background: profile.email_subscription ? "#ff914d" : "#e8ddd3" }}
                  aria-pressed={!!profile.email_subscription}
                  aria-label="Toggle email notifications"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      profile.email_subscription ? "translate-x-[1.25rem]" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </SettingsCard>

      </div>
    </div>
  );

  // ── Inline mode (inside a tile) ──────────────────────────────────────────────
  if (inline) return content;

  // ── Full page ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <ProfileHero
        title={firstName}
        eyebrow="Your account"
        subtitle="Name, email & preferences"
        compact
      />
      <div className="relative z-10">
        {content}
      </div>
    </div>
  );
}
