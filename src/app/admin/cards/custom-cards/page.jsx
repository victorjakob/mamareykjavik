"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminGuard from "../../AdminGuard";
import { format } from "date-fns";
import { formatPrice } from "@/util/IskFormat";
import {
  CreditCard,
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
  Plus,
  Edit,
  Trash2,
  Send,
  X,
  Building2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ManageCustomCards() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    used: 0,
    expired: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [cards, searchTerm, statusFilter]);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/admin/custom-cards");
      const data = await response.json();

      if (response.ok) {
        setCards(data.cards || []);
        calculateStats(data.cards || []);
      } else {
        toast.error(data.error || "Failed to load custom cards");
      }
    } catch (error) {
      toast.error("Failed to load custom cards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cardsList) => {
    const now = new Date();
    const active = cardsList.filter(
      (c) => c.status === "active" && c.remaining_balance > 0
    ).length;
    const used = cardsList.filter(
      (c) => c.status === "used" || c.remaining_balance === 0
    ).length;
    const expired = cardsList.filter((c) => c.status === "expired").length;
    const totalValue = cardsList.reduce((sum, c) => sum + (c.amount || 0), 0);

    setStats({
      total: cardsList.length,
      active,
      used,
      expired,
      totalValue,
    });
  };

  const filterCards = () => {
    let filtered = [...cards];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.card_name?.toLowerCase().includes(term) ||
          c.company_person?.toLowerCase().includes(term) ||
          c.recipient_email?.toLowerCase().includes(term) ||
          c.recipient_name?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    setFilteredCards(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this custom card?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/custom-cards/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Custom card deleted successfully");
        fetchCards();
      } else {
        toast.error(data.error || "Failed to delete custom card");
      }
    } catch (error) {
      toast.error("Failed to delete custom card");
      console.error(error);
    }
  };

  const handleResendEmail = async (id) => {
    try {
      const response = await fetch(`/api/admin/custom-cards/send-email/${id}`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Email sent successfully");
        fetchCards();
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send email");
      console.error(error);
    }
  };

  const copyToken = (token) => {
    const url = `${window.location.origin}/custom-card/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Card URL copied to clipboard!");
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: "#ff914d", color: "#000" }}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      ),
      used: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "#5a4a40" }}>
          <XCircle className="h-3 w-3 mr-1" />
          Used
        </span>
      ),
      expired: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "#5a4a40" }}>
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </span>
      ),
      cancelled: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(255,215,107,0.15)", color: "#ffd76f" }}>
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </span>
      ),
    };
    return badges[status] || badges.active;
  };

  const getExpirationInfo = (card) => {
    if (card.expiration_type === "none") {
      return "No expiration";
    }
    if (card.expiration_type === "date" && card.expiration_date) {
      return `Expires: ${format(new Date(card.expiration_date), "MMM d, yyyy")}`;
    }
    if (card.expiration_type === "monthly_reset") {
      return "Monthly reset";
    }
    if (card.expiration_type === "monthly_add" && card.monthly_amount) {
      return `Adds ${formatPrice(card.monthly_amount)} monthly`;
    }
    return "Unknown";
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen pt-24 pb-20 px-5 flex items-center justify-center" style={{ background: "linear-gradient(180deg, #17100a 0%, #0f0a05 100%)" }}>
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: "#ff914d" }} />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen pt-24 pb-20 px-5" style={{ background: "linear-gradient(180deg, #17100a 0%, #0f0a05 100%)" }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]/80 mb-1">Admin · Cards</p>
              <h1 className="font-cormorant italic text-[#f0ebe3] text-4xl font-light">
                Custom Cards
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-black"
              style={{ background: "#ff914d" }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Card
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)", border: "1px solid #3a2812" }}
            >
              <div className="h-[1.5px] absolute top-0 left-0 right-0" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
              <p className="text-sm" style={{ color: "#9a8e82" }}>Total Cards</p>
              <p className="font-cormorant italic text-[#f0ebe3] text-3xl font-light">{stats.total}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)", border: "1px solid #3a2812" }}
            >
              <div className="h-[1.5px] absolute top-0 left-0 right-0" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
              <p className="text-sm" style={{ color: "#9a8e82" }}>Active</p>
              <p className="font-cormorant italic text-[#f0ebe3] text-3xl font-light" style={{ color: "#ff914d" }}>{stats.active}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)", border: "1px solid #3a2812" }}
            >
              <div className="h-[1.5px] absolute top-0 left-0 right-0" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
              <p className="text-sm" style={{ color: "#9a8e82" }}>Used</p>
              <p className="font-cormorant italic text-[#f0ebe3] text-3xl font-light">{stats.used}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)", border: "1px solid #3a2812" }}
            >
              <div className="h-[1.5px] absolute top-0 left-0 right-0" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
              <p className="text-sm" style={{ color: "#9a8e82" }}>Total Value</p>
              <p className="font-cormorant italic text-[#f0ebe3] text-3xl font-light" style={{ color: "#ff914d" }}>
                {formatPrice(stats.totalValue)}
              </p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="rounded-xl p-6 mb-8" style={{ background: "#1c1208", border: "1px solid #3a2812" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: "#7a6a5a" }} />
                <input
                  type="text"
                  placeholder="Search by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl"
                  style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
                  onFocus={(e) => e.target.style.borderColor = "#ff914d"}
                  onBlur={(e) => e.target.style.borderColor = "#3a2812"}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: "#7a6a5a" }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl appearance-none"
                  style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
                  onFocus={(e) => e.target.style.borderColor = "#ff914d"}
                  onBlur={(e) => e.target.style.borderColor = "#3a2812"}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="used">Used</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#1c1208", border: "1px solid #3a2812" }}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ background: "#1c1208", borderBottom: "1px solid #2a1c0e" }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#9a8e82" }}>
                      Card Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#9a8e82" }}>
                      Company/Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#9a8e82" }}>
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#9a8e82" }}>
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#9a8e82" }}>
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#9a8e82" }}>
                      Expiration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#9a8e82" }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#9a8e82" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ borderBottom: "1px solid #2a1c0e" }}>
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center" style={{ color: "#9a8e82" }}>
                        No custom cards found
                      </td>
                    </tr>
                  ) : (
                    filteredCards.map((card) => (
                      <tr key={card.id} style={{ borderBottom: "1px solid #2a1c0e" }} onMouseEnter={(e) => e.currentTarget.style.background = "#241809"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: "#f0ebe3" }}>
                            {card.card_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: "#9a8e82" }}>
                            {card.company_person || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: "#f0ebe3" }}>
                            {card.recipient_name || "-"}
                          </div>
                          <div className="text-sm" style={{ color: "#9a8e82" }}>
                            {card.recipient_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: "#f0ebe3" }}>
                            {formatPrice(card.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: "#f0ebe3" }}>
                            {formatPrice(card.remaining_balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: "#9a8e82" }}>
                            {getExpirationInfo(card)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(card.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToken(card.access_token)}
                              style={{ color: "#ff914d" }}
                              title="Copy card URL"
                            >
                              <Copy className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleResendEmail(card.id)}
                              style={{ color: "#7ba3d8" }}
                              title="Resend email"
                            >
                              <Send className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingCard(card)}
                              style={{ color: "#7bc97d" }}
                              title="Edit card"
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(card.id)}
                              style={{ color: "#ff8080" }}
                              title="Delete card"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingCard) && (
          <CustomCardModal
            card={editingCard}
            onClose={() => {
              setShowCreateModal(false);
              setEditingCard(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setEditingCard(null);
              fetchCards();
            }}
          />
        )}
      </AnimatePresence>
    </AdminGuard>
  );
}

// Custom Card Modal Component
function CustomCardModal({ card, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    card_name: card?.card_name || "",
    company_person: card?.company_person || "",
    amount: card?.amount || "",
    remaining_balance: card?.remaining_balance || "",
    recipient_email: card?.recipient_email || "",
    recipient_name: card?.recipient_name || "",
    expiration_type: card?.expiration_type || "none",
    expiration_date: card?.expiration_date
      ? format(new Date(card.expiration_date), "yyyy-MM-dd")
      : "",
    monthly_amount: card?.monthly_amount || "",
    admin_description: card?.admin_description || "",
    status: card?.status || "active",
    send_email: !card, // Send email by default for new cards
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = card
        ? `/api/admin/custom-cards/${card.id}`
        : "/api/admin/custom-cards";
      const method = card ? "PATCH" : "POST";

      const payload = {
        ...formData,
        amount: parseInt(formData.amount),
        remaining_balance: card
          ? parseInt(formData.remaining_balance)
          : parseInt(formData.amount),
        monthly_amount: formData.monthly_amount
          ? parseInt(formData.monthly_amount)
          : null,
        expiration_date: formData.expiration_date || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          card ? "Custom card updated successfully" : "Custom card created successfully"
        );
        onSuccess();
      } else {
        toast.error(data.error || "Failed to save custom card");
      }
    } catch (error) {
      toast.error("Failed to save custom card");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)", border: "1px solid #3a2812" }}
      >
        <div className="sticky top-0 px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)", borderBottom: "1px solid #3a2812" }}>
          <h2 className="text-2xl font-bold" style={{ color: "#f0ebe3" }}>
            {card ? "Edit Custom Card" : "Create Custom Card"}
          </h2>
          <button
            onClick={onClose}
            style={{ color: "#7a6a5a" }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
              Card Name *
            </label>
            <input
              type="text"
              required
              value={formData.card_name}
              onChange={(e) =>
                setFormData({ ...formData, card_name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl"
              style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
              onFocus={(e) => e.target.style.borderColor = "#ff914d"}
              onBlur={(e) => e.target.style.borderColor = "#3a2812"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
              Company/Person
            </label>
            <input
              type="text"
              value={formData.company_person}
              onChange={(e) =>
                setFormData({ ...formData, company_person: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl"
              style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
              onFocus={(e) => e.target.style.borderColor = "#ff914d"}
              onBlur={(e) => e.target.style.borderColor = "#3a2812"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
                Amount (ISK) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl"
                style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
                onFocus={(e) => e.target.style.borderColor = "#ff914d"}
                onBlur={(e) => e.target.style.borderColor = "#3a2812"}
                disabled={!!card}
              />
            </div>
            {card && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
                  Remaining Balance (ISK) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.remaining_balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remaining_balance: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl"
                  style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
                  onFocus={(e) => e.target.style.borderColor = "#ff914d"}
                  onBlur={(e) => e.target.style.borderColor = "#3a2812"}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
                Recipient Email *
              </label>
              <input
                type="email"
                required
                value={formData.recipient_email}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_email: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl"
                style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
                onFocus={(e) => e.target.style.borderColor = "#ff914d"}
                onBlur={(e) => e.target.style.borderColor = "#3a2812"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
                Recipient Name
              </label>
              <input
                type="text"
                value={formData.recipient_name}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl"
                style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
                onFocus={(e) => e.target.style.borderColor = "#ff914d"}
                onBlur={(e) => e.target.style.borderColor = "#3a2812"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
              Expiration Type *
            </label>
            <select
              value={formData.expiration_type}
              onChange={(e) =>
                setFormData({ ...formData, expiration_type: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl"
              style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
              onFocus={(e) => e.target.style.borderColor = "#ff914d"}
              onBlur={(e) => e.target.style.borderColor = "#3a2812"}
            >
              <option value="none">No Expiration</option>
              <option value="date">Specific Date</option>
              <option value="monthly_reset">Monthly Reset</option>
              <option value="monthly_add">Monthly Add</option>
            </select>
          </div>

          {formData.expiration_type === "date" && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
                Expiration Date *
              </label>
              <input
                type="date"
                required={formData.expiration_type === "date"}
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiration_date: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl"
                style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
                onFocus={(e) => e.target.style.borderColor = "#ff914d"}
                onBlur={(e) => e.target.style.borderColor = "#3a2812"}
              />
            </div>
          )}

          {formData.expiration_type === "monthly_add" && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
                Monthly Amount (ISK) *
              </label>
              <input
                type="number"
                required={formData.expiration_type === "monthly_add"}
                min="1"
                value={formData.monthly_amount}
                onChange={(e) =>
                  setFormData({ ...formData, monthly_amount: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl"
                style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
                onFocus={(e) => e.target.style.borderColor = "#ff914d"}
                onBlur={(e) => e.target.style.borderColor = "#3a2812"}
              />
            </div>
          )}

          {card && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl"
                style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
                onFocus={(e) => e.target.style.borderColor = "#ff914d"}
                onBlur={(e) => e.target.style.borderColor = "#3a2812"}
              >
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#c0b4a8" }}>
              Admin Description (Optional)
            </label>
            <textarea
              value={formData.admin_description}
              onChange={(e) =>
                setFormData({ ...formData, admin_description: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-3 rounded-xl"
              style={{ background: "#17100a", border: "1px solid #3a2812", color: "#f0ebe3" }}
              onFocus={(e) => e.target.style.borderColor = "#ff914d"}
              onBlur={(e) => e.target.style.borderColor = "#3a2812"}
              placeholder="Internal notes (only visible to admins)"
            />
          </div>

          {!card && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="send_email"
                checked={formData.send_email}
                onChange={(e) =>
                  setFormData({ ...formData, send_email: e.target.checked })
                }
                className="h-4 w-4 rounded"
                style={{ accentColor: "#ff914d", borderColor: "#3a2812" }}
              />
              <label htmlFor="send_email" className="ml-2 text-sm" style={{ color: "#c0b4a8" }}>
                Send email with magic link to recipient
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid #3a2812" }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg"
              style={{ background: "#241809", border: "1px solid #3a2812", color: "#9a8e82" }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-black"
              style={{ background: "#ff914d", opacity: submitting ? 0.5 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 inline animate-spin mr-2" />
                  Saving...
                </>
              ) : card ? (
                "Update Card"
              ) : (
                "Create Card"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
