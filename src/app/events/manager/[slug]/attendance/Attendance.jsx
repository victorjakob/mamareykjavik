"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { formatPrice } from "@/util/IskFormat";
import Link from "next/link";
import { BarChart2, Mail, Ban } from "lucide-react";

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent = "#ff914d" }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#c0a890" }}>{label}</p>
      </div>
      <p className="font-cormorant font-light" style={{ fontSize: "2.4rem", lineHeight: 1, color: "#2c1810" }}>
        {value}
      </p>
    </div>
  );
}

// ── Ticket detail modal ────────────────────────────────────────────────────────
function TicketModal({ ticket, onClose }) {
  if (!ticket) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div
        className="w-full max-w-md rounded-2xl p-7"
        style={{ background: "#ffffff", border: "1.5px solid #f0e6d8", boxShadow: "0 20px 60px rgba(60,30,10,0.2)" }}
      >
        <h3 className="font-cormorant font-light italic text-2xl mb-5" style={{ color: "#2c1810" }}>
          Ticket Details
        </h3>
        <div className="space-y-2.5 mb-7">
          {[
            ["Name",          ticket.buyer_name],
            ["Email",         ticket.buyer_email],
            ["Quantity",      ticket.quantity],
            ["Status",        ticket.status],
            ["Variant",       ticket.variant_name || "N/A"],
            ["Price",         ticket.price != null ? formatPrice(ticket.price) : "N/A"],
            ["Total",         ticket.total_price != null ? formatPrice(ticket.total_price) : "N/A"],
            ["Purchased",     ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3 text-sm">
              <span className="w-24 flex-shrink-0 font-medium" style={{ color: "#c0a890" }}>{k}</span>
              <span style={{ color: "#2c1810" }}>{v}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-full text-sm font-semibold text-white"
          style={{ background: "#ff914d" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Message modal ──────────────────────────────────────────────────────────────
function MessageModal({ onClose, onSend, isSending }) {
  const [message, setMessage] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div
        className="w-full max-w-lg rounded-2xl p-7"
        style={{ background: "#ffffff", border: "1.5px solid #f0e6d8", boxShadow: "0 20px 60px rgba(60,30,10,0.2)" }}
      >
        <h3 className="font-cormorant font-light italic text-2xl mb-5" style={{ color: "#2c1810" }}>
          Message All Attendees
        </h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-36 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
          style={{ background: "#faf6f2", border: "1.5px solid #e8ddd3", color: "#2c1810" }}
          placeholder="Write your message to all attendees..."
        />
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
            style={{ background: "#ffffff", border: "1.5px solid #e8ddd3", color: "#9a7a62" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(message)}
            disabled={isSending || !message.trim()}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#ff914d" }}
          >
            {isSending ? "Sending…" : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sold-out confirm modal ─────────────────────────────────────────────────────
function SoldOutModal({ onClose, onConfirm, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div
        className="w-full max-w-md rounded-2xl p-7"
        style={{ background: "#ffffff", border: "1.5px solid #fecaca", boxShadow: "0 20px 60px rgba(60,30,10,0.2)" }}
      >
        <h3 className="font-cormorant font-light italic text-2xl mb-3" style={{ color: "#dc2626" }}>
          Mark as Sold Out?
        </h3>
        <p className="text-sm mb-7" style={{ color: "#9a7a62" }}>
          This will stop ticket sales and cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-medium"
            style={{ background: "#ffffff", border: "1.5px solid #e8ddd3", color: "#9a7a62" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#dc2626" }}
          >
            {isLoading ? "Marking…" : "Yes, mark sold out"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Attendance() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isMarkingSoldOut, setIsMarkingSoldOut] = useState(false);
  const [showSoldOutConfirm, setShowSoldOutConfirm] = useState(false);
  const [sortBy, setSortBy] = useState("buyer_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();

  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (ticket.buyer_name || "").toLowerCase().includes(q) ||
           (ticket.buyer_email || "").toLowerCase().includes(q);
  });

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        const filtered = tickets.filter((t) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (t.buyer_name || "").toLowerCase().includes(q) ||
                 (t.buyer_email || "").toLowerCase().includes(q);
        });
        const first = filtered.find((t) => !t.used);
        if (first) handleToggleUsed(first.id, first.used);
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [tickets, searchQuery]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data: eventData, error: eventError } = await supabase
          .from("events").select("id, name, date, sold_out").eq("slug", params.slug).single();
        if (eventError) throw eventError;
        if (!eventData) throw new Error("Event not found");
        setEventDetails(eventData);

        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select("id, buyer_email, buyer_name, quantity, status, used, created_at, variant_name, price, total_price")
          .eq("event_id", eventData.id)
          .in("status", ["paid", "door", "cash", "card", "transfer"])
          .order(sortBy, { ascending: sortOrder === "asc" });
        if (ticketsError) throw ticketsError;
        setTickets(ticketsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [params.slug, sortBy, sortOrder]);

  const handleToggleUsed = async (ticketId, currentUsed) => {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, used: !t.used } : t));
    try {
      const { error } = await supabase.from("tickets").update({ used: !currentUsed }).eq("id", ticketId);
      if (error) setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, used: currentUsed } : t));
    } catch {
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, used: currentUsed } : t));
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return alert("Please enter a message");
    try {
      setIsSending(true);
      const response = await fetch("/api/sendgrid/message-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerEmails: tickets.map((t) => t.buyer_email), message, eventName: eventDetails.name, eventDate: eventDetails.date }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      alert("Message sent successfully to all attendees!");
      setShowMessageModal(false);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkSoldOut = async () => {
    setIsMarkingSoldOut(true);
    try {
      const response = await fetch("/api/events/sold-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: eventDetails.id }),
      });
      if (!response.ok) { const d = await response.json(); throw new Error(d.message || "Failed"); }
      const { event } = await response.json();
      setEventDetails((prev) => ({ ...prev, sold_out: event.sold_out }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMarkingSoldOut(false);
      setShowSoldOutConfirm(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <PropagateLoader color="#ff914d" size={12} />
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto px-5 py-20 text-center">
      <div className="rounded-2xl p-8" style={{ background: "#fff1f0", border: "1.5px solid #fecaca" }}>
        <XCircleIcon className="h-10 w-10 mx-auto mb-4" style={{ color: "#dc2626" }} />
        <p className="text-sm" style={{ color: "#dc2626" }}>{error}</p>
      </div>
    </div>
  );

  const totalSold    = tickets.reduce((s, t) => s + t.quantity, 0);
  const checkedIn    = tickets.filter((t) => t.used).reduce((s, t) => s + t.quantity, 0);
  const notCheckedIn = totalSold - checkedIn;

  return (
    <>
      {/* Modals */}
      {showMessageModal && (
        <MessageModal onClose={() => setShowMessageModal(false)} onSend={handleSendMessage} isSending={isSending} />
      )}
      {selectedTicket && (
        <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
      {showSoldOutConfirm && (
        <SoldOutModal onClose={() => setShowSoldOutConfirm(false)} onConfirm={handleMarkSoldOut} isLoading={isMarkingSoldOut} />
      )}

      <div className="max-w-5xl mx-auto px-5 pt-8 pb-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] mb-1" style={{ color: "#ff914d" }}>
              {eventDetails?.name}
            </p>
            <h1
              className="font-cormorant font-light italic"
              style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "#2c1810" }}
            >
              Ticket Sales
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 sm:mt-1">
            <button
              onClick={() => setShowMessageModal(true)}
              disabled={tickets.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: "#ffffff", border: "1.5px solid #e8ddd3", color: "#9a7a62" }}
            >
              <Mail className="h-3.5 w-3.5" />
              Message All
            </button>
            <Link
              href={`/events/manager/${params.slug}/sales-stats`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{ background: "#ecfdf5", border: "1.5px solid #bbf7d0", color: "#059669" }}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Sales Stats
            </Link>
            <button
              onClick={() => setShowSoldOutConfirm(true)}
              disabled={isMarkingSoldOut || eventDetails?.sold_out}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-40"
              style={eventDetails?.sold_out
                ? { background: "#f3f0ec", color: "#c0a890", border: "1.5px solid #e8ddd3" }
                : { background: "#fff1f0", border: "1.5px solid #fecaca", color: "#dc2626" }
              }
            >
              <Ban className="h-3.5 w-3.5" />
              {eventDetails?.sold_out ? "Sold Out" : "Mark Sold Out"}
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Sold"   value={totalSold}    accent="#ff914d" />
          <StatCard label="Checked In"   value={checkedIn}    accent="#10b981" />
          <StatCard label="Not Checked"  value={notCheckedIn} accent="#f59e0b" />
        </div>

        {/* Table card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#ffffff", border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}
        >
          {/* Controls */}
          <div className="px-5 py-4" style={{ background: "#faf6f2", borderBottom: "1.5px solid #e8ddd3" }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold" style={{ color: "#2c1810" }}>
                  Attendees
                  <span className="ml-2 font-normal" style={{ color: "#9a7a62" }}>
                    ({filteredTickets.length}{searchQuery && ` of ${tickets.length}`})
                  </span>
                </h3>
                <span
                  className="text-[10px] px-2 py-1 rounded-lg"
                  style={{ background: "#f0e6d8", color: "#c0a890" }}
                >
                  ⌘↵ check next
                </span>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => { const [b, o] = e.target.value.split("-"); setSortBy(b); setSortOrder(o); }}
                  className="text-sm px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2"
                  style={{ background: "#ffffff", border: "1.5px solid #e8ddd3", color: "#2c1810", focusRingColor: "#ff914d" }}
                >
                  <option value="buyer_name-asc">Name A–Z</option>
                  <option value="buyer_name-desc">Name Z–A</option>
                  <option value="created_at-desc">Newest first</option>
                  <option value="created_at-asc">Oldest first</option>
                  <option value="buyer_email-asc">Email A–Z</option>
                  <option value="quantity-desc">Qty high–low</option>
                  <option value="quantity-asc">Qty low–high</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="mt-3 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full text-sm px-4 py-2.5 rounded-xl focus:outline-none"
                style={{ background: "#ffffff", border: "1.5px solid #e8ddd3", color: "#2c1810" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "#c0a890" }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ background: "#ff914d" }}>
                  {["Used", "Name", "Email", "Qty", "Status"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-white ${i === 2 ? "hidden sm:table-cell" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, i) => (
                  <tr
                    key={ticket.id}
                    className="transition-colors"
                    style={{
                      background: ticket.used ? "#f0fdf4" : i % 2 === 0 ? "#ffffff" : "#fdfaf7",
                      borderBottom: "1px solid #f0e6d8",
                      borderLeft: ticket.used ? "3px solid #10b981" : "3px solid transparent",
                    }}
                    onMouseEnter={e => { if (!ticket.used) e.currentTarget.style.background = "#faf6f2"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ticket.used ? "#f0fdf4" : i % 2 === 0 ? "#ffffff" : "#fdfaf7"; }}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={ticket.used || false}
                          onChange={() => handleToggleUsed(ticket.id, ticket.used)}
                          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl cursor-pointer transition-all transform hover:scale-110 active:scale-95
                            ${ticket.used
                              ? "bg-green-500 border-green-500 shadow-lg shadow-green-200"
                              : "bg-white border-2 border-[#e8ddd3] hover:border-green-400 hover:bg-green-50"
                            }
                            appearance-none relative
                            after:content-[''] after:absolute after:left-1/2 after:top-1/2
                            after:-translate-x-1/2 after:-translate-y-1/2 after:w-4 after:h-4
                            after:border-white after:border-b-2 after:border-r-2 after:rotate-45
                            checked:after:block after:hidden`}
                          aria-label={`Mark ${ticket.buyer_name} as ${ticket.used ? "unused" : "used"}`}
                        />
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#2c1810" }}>
                        {ticket.buyer_name}
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                          className="transition-colors"
                          style={{ color: "#c0a890" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#ff914d"}
                          onMouseLeave={e => e.currentTarget.style.color = "#c0a890"}
                          aria-label="Show ticket info"
                        >
                          <InformationCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="hidden sm:table-cell px-4 py-3.5 whitespace-nowrap text-sm" style={{ color: "#9a7a62" }}>
                      {ticket.buyer_email}
                    </td>
                    {/* Qty */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm" style={{ color: "#9a7a62" }}>
                      {ticket.quantity}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {["paid", "cash", "card", "transfer"].includes(ticket.status) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "#f0fdf4", color: "#059669" }}>
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "#fff1f0", color: "#dc2626" }}>
                          <XCircleIcon className="h-3.5 w-3.5" />
                          Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-14 px-4">
              <p className="text-sm" style={{ color: "#9a7a62" }}>
                {searchQuery ? "No tickets match your search." : "No tickets have been sold yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
