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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      ),
      used: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3 mr-1" />
          Used
        </span>
      ),
      expired: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </span>
      ),
      cancelled: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-16 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Custom Cards
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage custom cards for companies and individuals
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
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
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <p className="text-sm text-gray-500">Total Cards</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <p className="text-sm text-gray-500">Used</p>
              <p className="text-3xl font-bold text-gray-600">{stats.used}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatPrice(stats.totalValue)}
              </p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company/Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        No custom cards found
                      </td>
                    </tr>
                  ) : (
                    filteredCards.map((card) => (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {card.card_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {card.company_person || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {card.recipient_name || "-"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {card.recipient_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(card.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(card.remaining_balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
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
                              className="text-orange-600 hover:text-orange-900"
                              title="Copy card URL"
                            >
                              <Copy className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleResendEmail(card.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Resend email"
                            >
                              <Send className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingCard(card)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit card"
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(card.id)}
                              className="text-red-600 hover:text-red-900"
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {card ? "Edit Custom Card" : "Create Custom Card"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Name *
            </label>
            <input
              type="text"
              required
              value={formData.card_name}
              onChange={(e) =>
                setFormData({ ...formData, card_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company/Person
            </label>
            <input
              type="text"
              value={formData.company_person}
              onChange={(e) =>
                setFormData({ ...formData, company_person: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={!!card}
              />
            </div>
            {card && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email *
              </label>
              <input
                type="email"
                required
                value={formData.recipient_email}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={formData.recipient_name}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Type *
            </label>
            <select
              value={formData.expiration_type}
              onChange={(e) =>
                setFormData({ ...formData, expiration_type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="none">No Expiration</option>
              <option value="date">Specific Date</option>
              <option value="monthly_reset">Monthly Reset</option>
              <option value="monthly_add">Monthly Add</option>
            </select>
          </div>

          {formData.expiration_type === "date" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date *
              </label>
              <input
                type="date"
                required={formData.expiration_type === "date"}
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiration_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          )}

          {formData.expiration_type === "monthly_add" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          )}

          {card && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Description (Optional)
            </label>
            <textarea
              value={formData.admin_description}
              onChange={(e) =>
                setFormData({ ...formData, admin_description: e.target.value })
              }
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="send_email" className="ml-2 text-sm text-gray-700">
                Send email with magic link to recipient
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

