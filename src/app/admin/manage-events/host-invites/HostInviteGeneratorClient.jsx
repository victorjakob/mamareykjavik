"use client";

import { useState } from "react";

export default function HostInviteGeneratorClient() {
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [emailMeta, setEmailMeta] = useState(null);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setCopied(false);
    setStatusMessage("");
    setEmailMeta(null);

    try {
      const res = await fetch("/api/admin/host-invites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sendEmail }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to generate invite link.");
      }

      setInviteUrl(json.inviteUrl || "");
      if (json.emailSent) {
        setStatusMessage("Invite link created and welcome email sent.");
        setEmailMeta({
          sent: true,
          id: json.emailId || null,
        });
      } else if (json.emailError) {
        setStatusMessage(
          `Invite link created, but the email was not sent automatically: ${json.emailError}`
        );
        setEmailMeta({
          sent: false,
          id: json.emailId || null,
        });
      } else {
        setStatusMessage("Invite link created. You can copy and send it manually.");
      }
    } catch (err) {
      console.error("Error generating host invite:", err);
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
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying invite URL:", err);
      setError("Could not copy the invite link. You can still copy it manually.");
    }
  };

  return (
    <main className="mx-auto mt-24 max-w-3xl px-4 pb-16">
      <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
          White Lotus host invite
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Generate a host onboarding link
        </h1>
        <p className="mt-3 text-gray-600">
          Enter the host&apos;s email, generate a secure invite URL, and send it to
          them. When they open it, they&apos;ll log in or sign up, become a host,
          and land directly on create event.
        </p>

        <form onSubmit={handleGenerate} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="host-invite-email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Host email
            </label>
            <input
              id="host-invite-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="host@example.com"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-orange-50/40 px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(event) => setSendEmail(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            <span>
              Send a welcome email automatically with the secure invite link,
              create-event entry, and manage-events link.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Generating..." : "Generate invite link"}
          </button>
        </form>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {statusMessage}
            {emailMeta?.sent && emailMeta?.id ? (
              <div className="mt-1 text-xs text-emerald-800/80">
                Email provider id: <span className="font-mono">{emailMeta.id}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {inviteUrl ? (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-sm font-medium text-gray-900">Invite link</p>
            <p className="mt-2 break-all rounded-xl bg-white px-4 py-3 text-sm text-gray-700">
              {inviteUrl}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
              <a
                href={inviteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Open invite page
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
