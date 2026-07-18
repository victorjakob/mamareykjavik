"use client";

/**
 * CommunityLinkSection
 *
 * Lets the host attach ONE community join link to an event — a WhatsApp
 * group, Telegram channel, Facebook group, etc. — so people who come to
 * the events can find each other and stay in the loop between sessions.
 *
 * Two independent switches control where the link appears:
 *   • community_link_public   → shown on the public event page
 *   • community_link_in_email → included warmly in the ticket
 *                               confirmation email
 *
 * All fields are registered on the parent react-hook-form, so they ride
 * along with auto-save drafts and submission exactly like every other
 * field. Shared by the create-event and edit-event forms.
 */

import { detectCommunityPlatform } from "@/lib/communityLink";

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30 transition-all duration-200";
const inputStyle = {
  backgroundColor: "#faf6f2",
  color: "#2c1810",
  border: "1px solid #e8ddd3",
};

export default function CommunityLinkSection({ register, watch, errors }) {
  const link = (watch("community_link") || "").trim();
  const platform = detectCommunityPlatform(link);

  return (
    <div className="space-y-5">
      {/* Join link */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="community_link"
            className="block text-xs font-medium tracking-wide"
            style={{ color: "#9a7a62" }}
          >
            Community Join Link (Optional)
          </label>
          {platform && platform.name && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(255,145,77,0.1)",
                color: "#c76a2b",
                border: "1px solid rgba(255,145,77,0.25)",
              }}
            >
              {platform.name} detected
            </span>
          )}
        </div>
        <input
          {...register("community_link")}
          id="community_link"
          type="url"
          className={inputCls}
          style={inputStyle}
          placeholder="https://chat.whatsapp.com/… or t.me/… or facebook.com/groups/…"
        />
        {errors?.community_link && (
          <p className="mt-1.5 text-xs text-[#c05a1a]">
            {errors.community_link.message}
          </p>
        )}
        {!errors?.community_link && (
          <p className="mt-1.5 text-xs" style={{ color: "#9a7a62" }}>
            Paste an invite link from WhatsApp, Telegram, a Facebook group —
            any place where this event&apos;s community gathers.
          </p>
        )}
      </div>

      {/* Everything below only matters once there is a link */}
      {link && (
        <>
          {/* Community name */}
          <div>
            <label
              htmlFor="community_link_label"
              className="block text-xs font-medium mb-2 tracking-wide"
              style={{ color: "#9a7a62" }}
            >
              Community Name (Optional)
            </label>
            <input
              {...register("community_link_label")}
              id="community_link_label"
              type="text"
              className={inputCls}
              style={inputStyle}
              placeholder='e.g. "Free Your Voice — WhatsApp group"'
            />
            <p className="mt-1.5 text-xs" style={{ color: "#9a7a62" }}>
              Shown on the button so people know what they&apos;re joining. If
              left empty we use {platform?.name ? `"Join on ${platform.name}"` : `"Join the community"`}.
            </p>
          </div>

          {/* Visibility switches */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: "#faf6f2", border: "1px solid #e8ddd3" }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "#9a7a62" }}
            >
              Where should it appear?
            </p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded accent-[#ff914d]"
                {...register("community_link_public")}
              />
              <span className="text-sm leading-snug text-[#2c1810]">
                <span className="font-medium">Show on the event page</span>
                <span className="block text-xs mt-0.5" style={{ color: "#9a7a62" }}>
                  Everyone who opens the event on mama.is can join.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded accent-[#ff914d]"
                {...register("community_link_in_email")}
              />
              <span className="text-sm leading-snug text-[#2c1810]">
                <span className="font-medium">
                  Include in ticket confirmation emails
                </span>
                <span className="block text-xs mt-0.5" style={{ color: "#9a7a62" }}>
                  Ticket buyers get a warm invite to join the community in
                  their confirmation email.
                </span>
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
