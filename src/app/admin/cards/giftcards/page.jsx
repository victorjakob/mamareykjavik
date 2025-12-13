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

export default function ManageGiftCards() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    used: 0,
    pending: 0,
    totalValue: 0,
    totalRemaining: 0,
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
    const active = cardsList.filter(
      (c) => c.status === "paid" && c.remaining_balance > 0
    );
    const used = cardsList.filter(
      (c) => c.remaining_balance === 0 && c.status === "paid"
    );
    const pending = cardsList.filter((c) => c.status === "pending");
    const totalValue = cardsList.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalRemaining = cardsList.reduce(
      (sum, c) => sum + (c.remaining_balance || 0),
      0
    );

    setStats({
      total: cardsList.length,
      active: active.length,
      used: used.length,
      pending: pending.length,
      totalValue,
      totalRemaining,
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
        if (statusFilter === "active") {
          return card.status === "paid" && card.remaining_balance > 0;
        } else if (statusFilter === "used") {
          return card.remaining_balance === 0 && card.status === "paid";
        } else if (statusFilter === "pending") {
          return card.status === "pending";
        } else if (statusFilter === "sent") {
          return card.status === "sent";
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
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        Icon: Clock,
      };
    }
    if (card.remaining_balance === 0 && card.status === "paid") {
      return {
        label: "Used",
        color: "text-gray-600",
        bg: "bg-gray-50",
        Icon: CheckCircle,
      };
    }
    if (card.status === "sent") {
      return {
        label: "Sent",
        color: "text-blue-600",
        bg: "bg-blue-50",
        Icon: Package,
      };
    }
    return {
      label: "Active",
      color: "text-green-600",
      bg: "bg-green-50",
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
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                  Gift Cards Management
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Overview and management of all gift cards
                </p>
              </div>
              <Link
                href="/admin/cards"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Cards
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 mb-8">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Gift className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Cards
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {stats.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Cards
                      </dt>
                      <dd className="text-2xl font-bold text-green-600">
                        {stats.active}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Fully Used
                      </dt>
                      <dd className="text-2xl font-bold text-gray-600">
                        {stats.used}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending
                      </dt>
                      <dd className="text-2xl font-bold text-yellow-600">
                        {stats.pending}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-white truncate">
                        Total Value
                      </dt>
                      <dd className="text-2xl font-bold text-white">
                        {formatPrice(stats.totalValue)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-white truncate">
                        Remaining
                      </dt>
                      <dd className="text-2xl font-bold text-white">
                        {formatPrice(stats.totalRemaining)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, email, or order ID..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    <option value="all">All Cards</option>
                    <option value="active">Active</option>
                    <option value="used">Fully Used</option>
                    <option value="pending">Pending Payment</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Cards List ({filteredCards.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {filteredCards.length === 0 ? (
                <li className="px-6 py-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No cards found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
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
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}
                            >
                              <statusInfo.Icon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                              {formatPrice(card.remaining_balance)}
                            </span>
                            <span className="text-sm text-gray-500">
                              / {formatPrice(card.amount)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{card.buyer_name}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">
                                {card.buyer_email}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <DeliveryIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="capitalize">
                                {card.delivery_method}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
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
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
                            className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
                                className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
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
                                className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Mark Sent
                              </motion.button>
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

