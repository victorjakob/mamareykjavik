"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminGuard from "../../AdminGuard";
import { format } from "date-fns";
import { formatPrice } from "@/util/IskFormat";
import {
  Gift,
  Search,
  Filter,
  Copy,
  ExternalLink,
  Calendar,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Package,
  MapPin,
  Mail as MailIcon,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

// Component for adding Dineout code
function DineoutCodeInput({ cardId, onCodeAdded }) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a Dineout code");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/gift-cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dineout_code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Dineout code added successfully!");
        onCodeAdded(code.trim());
        setCode("");
      } else {
        toast.error(data.error || "Failed to add Dineout code");
      }
    } catch (error) {
      toast.error("Failed to add Dineout code");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-flex items-center gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Dineout code"
        className="px-2 py-1 text-sm bg-[#17100a] border border-[#3a2812] text-[#f0ebe3] placeholder-[#5a4a40] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff914d]/30 focus:border-[#ff914d]/60"
        disabled={isSubmitting}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={isSubmitting || !code.trim()}
        className="inline-flex items-center px-3 py-1 border border-[#ff914d]/50 shadow-sm text-sm leading-4 font-medium rounded-md text-[#000] bg-[#ff914d] hover:bg-[#ff914d]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Adding..." : "Add Code"}
      </motion.button>
    </form>
  );
}

export default function ManageGiftCards() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    sent: 0,
    paid: 0,
  });

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [cards, searchTerm, statusFilter]);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/admin/gift-cards");
      const data = await response.json();

      if (response.ok) {
        setCards(data.cards);
        calculateStats(data.cards);
      } else {
        toast.error(data.error || "Failed to load gift cards");
      }
    } catch (error) {
      toast.error("Failed to load gift cards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cardsList) => {
    // Only calculate stats for non-pending cards
    const nonPendingCards = cardsList.filter((c) => c.status !== "pending");

    const totalValue = nonPendingCards.reduce((sum, c) => sum + (c.amount || 0), 0);
    const sent = nonPendingCards.filter((c) => c.status === "sent").length;
    const paid = nonPendingCards.filter((c) => c.status === "paid").length;

    setStats({
      total: nonPendingCards.length,
      active: 0, // Not tracking usage
      used: 0, // Not tracking usage
      pending: 0,
      totalValue,
      totalRemaining: 0, // Not tracking remaining balance
      sent,
      paid,
    });
  };

  const filterCards = () => {
    let filtered = [...cards];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (card) =>
          card.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.recipient_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((card) => {
        if (statusFilter === "pending") {
          return card.status === "pending";
        } else if (statusFilter === "sent") {
          return card.status === "sent";
        } else if (statusFilter === "paid") {
          return card.status === "paid";
        }
        return true;
      });
    }

    setFilteredCards(filtered);
  };

  const copyMagicLink = (token) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/gift-card/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Magic link copied to clipboard!");
  };

  const updateCardStatus = async (cardId, updates) => {
    try {
      const response = await fetch(`/api/admin/gift-cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Gift card updated successfully");
        fetchCards(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to update gift card");
      }
    } catch (error) {
      toast.error("Failed to update gift card");
      console.error(error);
    }
  };

  const getStatusInfo = (card) => {
    if (card.status === "pending") {
      return {
        label: "Pending",
        color: "text-[#d4a574]",
        bg: "bg-[#3a2812]/40",
        Icon: Clock,
      };
    }
    if (card.remaining_balance === 0 && card.status === "paid") {
      return {
        label: "Used",
        color: "text-[#9a8e82]",
        bg: "bg-[#241809]/60",
        Icon: CheckCircle,
      };
    }
    if (card.status === "sent") {
      return {
        label: "Sent",
        color: "text-[#7ab3d4]",
        bg: "bg-[#1c2a38]/60",
        Icon: Package,
      };
    }
    return {
      label: "Active",
      color: "text-[#ff914d]",
      bg: "rgba(255,145,77,0.15)",
      Icon: CheckCircle,
    };
  };

  const getDeliveryIcon = (method) => {
    switch (method) {
      case "email":
        return MailIcon;
      case "pickup":
        return MapPin;
      case "mail":
        return Package;
      default:
        return Package;
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-[#0f0a07] pt-24 pb-20 px-5 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-[#ff914d] animate-spin" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen pt-24 pb-20 px-5" style={{ background: "#0f0a07" }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]/80 mb-1">
                  Admin · Cards
                </p>
                <h1 className="font-cormorant italic text-[#f0ebe3] text-4xl font-light">
                  Gift Cards
                </h1>
              </div>
              <Link
                href="/admin/cards"
                className="text-[#9a8e82] hover:text-[#c0b4a8] transition-colors"
              >
                ← Back to Cards
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <motion.div
              whileHover={{ y: -2 }}
              style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)" }}
              className="overflow-hidden rounded-xl p-6 border border-[#3a2812]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <Gift className="h-6 w-6 text-[#ff914d]/60" />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-[#9a8e82] text-sm font-light mb-1">Total Cards</p>
                <p className="font-cormorant italic text-[#f0ebe3] text-3xl font-light">
                  {stats.total}
                </p>
              </div>
              <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)" }}
              className="overflow-hidden rounded-xl p-6 border border-[#3a2812]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <Gift className="h-6 w-6 text-[#ff914d]/60" />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-[#9a8e82] text-sm font-light mb-1">Total Value</p>
                <p className="font-cormorant italic text-[#f0ebe3] text-3xl font-light">
                  {formatPrice(stats.totalValue)}
                </p>
              </div>
              <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)" }}
              className="overflow-hidden rounded-xl p-6 border border-[#3a2812]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-[#7ab3d4]/60" />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-[#9a8e82] text-sm font-light mb-1">Sent by Mail</p>
                <p className="font-cormorant italic text-[#f0ebe3] text-3xl font-light">
                  {stats.sent}
                </p>
              </div>
              <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
            </motion.div>
          </div>

          {/* Filters */}
          <div style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)" }} className="rounded-xl p-6 mb-6 border border-[#3a2812]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Search */}
              <div>
                <label className="block text-sm font-light text-[#c0b4a8] mb-3">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-[#5a4a40]" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, email, or order ID..."
                    className="block w-full pl-10 pr-3 py-2 bg-[#17100a] border border-[#3a2812] rounded-lg leading-5 text-[#f0ebe3] placeholder-[#5a4a40] focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30 sm:text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-light text-[#c0b4a8] mb-3">
                  Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-[#5a4a40]" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-[#17100a] border border-[#3a2812] rounded-lg leading-5 text-[#f0ebe3] focus:outline-none focus:ring-1 focus:ring-[#ff914d]/30 focus:border-[#ff914d]/60 sm:text-sm appearance-none"
                  >
                    <option value="all">All Cards</option>
                    <option value="paid">Paid</option>
                    <option value="sent">Sent</option>
                    <option value="pending">Pending Payment</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)" }} className="rounded-xl overflow-hidden border border-[#3a2812]">
            <div className="px-6 py-5 border-b border-[#3a2812]">
              <h3 className="font-light text-[#f0ebe3]">
                Cards List ({filteredCards.length})
              </h3>
            </div>
            <ul className="divide-y divide-[#3a2812]">
              {filteredCards.length === 0 ? (
                <li className="px-6 py-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-[#5a4a40]" />
                  <h3 className="mt-2 text-sm font-light text-[#f0ebe3]">
                    No cards found
                  </h3>
                  <p className="mt-1 text-sm text-[#7a6a5a]">
                    Try adjusting your search or filter criteria
                  </p>
                </li>
              ) : (
                filteredCards.map((card) => {
                  const statusInfo = getStatusInfo(card);
                  const DeliveryIcon = getDeliveryIcon(card.delivery_method);
                  return (
                    <motion.li
                      key={card.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-6 py-4 hover:bg-[#241809]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-light border ${statusInfo.color} ${statusInfo.bg === "rgba(255,145,77,0.15)" ? "border-[#ff914d]/30" : "border-current/20"}`}
                              style={{
                                backgroundColor: statusInfo.bg === "rgba(255,145,77,0.15)" ? statusInfo.bg : undefined,
                              }}
                            >
                              <statusInfo.Icon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </div>
                            <span className="font-cormorant italic text-[#f0ebe3] text-2xl font-light">
                              {formatPrice(card.remaining_balance)}
                            </span>
                            <span className="text-sm text-[#7a6a5a]">
                              / {formatPrice(card.amount)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center text-[#c0b4a8]">
                              <User className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{card.buyer_name}</span>
                            </div>
                            <div className="flex items-center text-[#c0b4a8]">
                              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">
                                {card.buyer_email}
                              </span>
                            </div>
                            <div className="flex items-center text-[#c0b4a8]">
                              <DeliveryIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="capitalize">
                                {card.delivery_method}
                              </span>
                            </div>
                            <div className="flex items-center text-[#c0b4a8]">
                              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>
                                {format(new Date(card.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6 flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyMagicLink(card.access_token)}
                            className="inline-flex items-center px-3 py-2 border border-[#3a2812] shadow-sm text-sm leading-4 font-light rounded-lg text-[#c0b4a8] bg-[#17100a] hover:bg-[#241809] focus:outline-none focus:ring-1 focus:ring-[#ff914d]/30"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </motion.button>
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={`/gift-card/${card.access_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 border border-[#ff914d]/40 shadow-sm text-sm leading-4 font-light rounded-lg text-[#ff914d] bg-[#ff914d]/10 hover:bg-[#ff914d]/20 focus:outline-none focus:ring-1 focus:ring-[#ff914d]/30"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </motion.a>
                          {card.delivery_method === "pickup" &&
                            card.status === "paid" &&
                            !card.picked_up && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  updateCardStatus(card.id, { picked_up: true })
                                }
                                className="inline-flex items-center px-3 py-2 border border-[#7ab3d4]/40 shadow-sm text-sm leading-4 font-light rounded-lg text-[#7ab3d4] bg-[#7ab3d4]/10 hover:bg-[#7ab3d4]/20"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Mark Picked Up
                              </motion.button>
                            )}
                          {card.delivery_method === "mail" &&
                            card.status === "paid" &&
                            !card.sent_at && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  updateCardStatus(card.id, {
                                    status: "sent",
                                    sent_at: new Date().toISOString(),
                                  })
                                }
                                className="inline-flex items-center px-3 py-2 border border-[#7ab3d4]/40 shadow-sm text-sm leading-4 font-light rounded-lg text-[#7ab3d4] bg-[#7ab3d4]/10 hover:bg-[#7ab3d4]/20"
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Mark Sent
                              </motion.button>
                            )}
                          {card.delivery_method === "email" &&
                            card.status === "paid" &&
                            !card.dineout_code && (
                              <DineoutCodeInput
                                cardId={card.id}
                                onCodeAdded={() => {
                                  fetchCards(); // Refresh the list
                                }}
                              />
                            )}
                          {card.delivery_method === "email" &&
                            card.status === "paid" &&
                            card.dineout_code && (
                              <div className="inline-flex items-center px-3 py-2 border border-[#ff914d]/40 shadow-sm text-sm leading-4 font-light rounded-lg text-[#ff914d] bg-[#ff914d]/10">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Code: {card.dineout_code}
                              </div>
                            )}
                        </div>
                      </div>
                    </motion.li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
