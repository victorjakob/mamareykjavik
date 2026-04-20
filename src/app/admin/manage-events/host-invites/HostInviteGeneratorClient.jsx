"use client";

import { useState } from "react";
import { Loader2, Copy, Check, ExternalLink } from "lucide-react";

export default function HostInviteGeneratorClient() {
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [emailMeta, setEmailMeta] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); setCopied(false); setStatusMessage(""); setEmailMeta(null);
    try {
      const res = await fetch("/api/admin/host-invites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sendEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to generate invite link.");
      setInviteUrl(json.inviteUrl || "");
      if (json.emailSent) {
        setStatusMessage("Invite link created and welcome email sent.");
        setEmailMeta({ sent: true, id: json.emailId || null });
      } else if (json.emailError) {
        setStatusMessage(`Invite created, but email failed: ${json.emailError}`);
        setEmailMeta({ sent: false, id: json.emailId || null });
      } else {
        setStatusMessage("Invite link created. Copy and send manually.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate invite link.");
      setInviteUrl("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Please copy manually.");
    }
  };

  const inputCls = `w-full px-4 py-3 rounded-xl text-sm text-[#2c1810] placeholder-[#9a7a62]
    bg-[#faf6f2] border border-[#e8ddd3]
    focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30
    transition-all duration-200`;

  return (
    <main className="min-h-screen pt-24 pb-20 px-5">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]/80 mb-1">Admin · Events</p>
          <h1 className="font-cormorant italic text-[#2c1810] text-4xl font-light">Host Invite</h1>
          <p className="text-[#9a7a62] text-sm mt-1">
            Generate a secure onboarding link for a new event host.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1.5px solid #f0e6d8",
            boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
          }}
        >
          <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
          <div className="p-6 sm:p-8">

            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label htmlFor="host-invite-email" className="block text-xs font-medium text-[#9a7a62] mb-2 tracking-wide">
                  Host email
                </label>
                <input
                  id="host-invite-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="host@example.com"
                  className={inputCls}
                />
              </div>

              <label className="flex items-start gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors"
                style={{ background: "rgba(255,145,77,0.05)", border: "1px solid rgba(255,145,77,0.12)" }}>
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#3a2812] accent-[#ff914d]"
                />
                <span className="text-sm text-[#2c1810] leading-relaxed">
                  Send a welcome email automatically with the secure invite link, create-event entry, and manage-events link.
                </span>
              </label>

              <button type="submit" disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#ff914d", color: "#000" }}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : "Generate invite link"}
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl px-4 py-3 text-sm text-[#ff6b6b]"
                style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)" }}>
                {error}
              </div>
            )}

            {/* Status message */}
            {statusMessage && (
              <div className="mt-5 rounded-xl px-4 py-3 text-sm text-[#ff914d]"
                style={{ background: "rgba(255,145,77,0.08)", border: "1px solid rgba(255,145,77,0.2)" }}>
                {statusMessage}
                {emailMeta?.sent && emailMeta?.id && (
                  <p className="mt-1 text-xs text-[#7a6a5a] font-mono">Email ID: {emailMeta.id}</p>
                )}
              </div>
            )}

            {/* Invite URL result */}
            {inviteUrl && (
              <div className="mt-6 rounded-xl p-4"
                style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                <p className="text-xs text-[#9a7a62] mb-2 uppercase tracking-wide">Invite link</p>
                <p className="break-all text-xs text-[#2c1810] font-mono leading-relaxed mb-4">{inviteUrl}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all"
                    style={{ background: copied ? "rgba(255,145,77,0.15)" : "#faf6f2", border: "1px solid #e8ddd3", color: copied ? "#ff914d" : "#9a7a62" }}>
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
                  </button>
                  <a href={inviteUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-[#9a7a62] transition-all"
                    style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}>
                    <ExternalLink className="w-3.5 h-3.5" /> Open invite page
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
