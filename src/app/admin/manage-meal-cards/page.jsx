"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminGuard from "../AdminGuard";
import { format } from "date-fns";
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
  History,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ManageMealCards() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showUsageHistory, setShowUsageHistory] = useState(false);
  const [usageHistory, setUsageHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    used: 0,
    expired: 0,
    totalMealsRemaining: 0,
    totalMealsUsed: 0,
  });

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [cards, searchTerm, statusFilter]);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/admin/meal-cards");
      const data = await response.json();

      if (response.ok) {
        setCards(data.cards);
        calculateStats(data.cards);
      } else {
        toast.error(data.error || "Failed to load meal cards");
      }
    } catch (error) {
      toast.error("Failed to load meal cards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cardsList) => {
    const now = new Date();
    const active = cardsList.filter(
      (c) =>
        c.status === "paid" &&
        c.meals_remaining > 0 &&
        new Date(c.valid_until) > now
    );
    const used = cardsList.filter(
      (c) => c.meals_remaining === 0 && c.status === "paid"
    );
    const expired = cardsList.filter((c) => new Date(c.valid_until) < now);
    const totalMealsRemaining = cardsList.reduce(
      (sum, c) => sum + c.meals_remaining,
      0
    );
    
    // Calculate total meals used (5 - remaining for each paid card)
    const totalMealsUsed = cardsList
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + (5 - c.meals_remaining), 0);

    setStats({
      total: cardsList.length,
      active: active.length,
      used: used.length,
      expired: expired.length,
      totalMealsRemaining,
      totalMealsUsed,
    });
  };

  const fetchUsageHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch("/api/admin/meal-cards/usage-history");
      const data = await response.json();

      if (response.ok) {
        setUsageHistory(data.history);
      } else {
        toast.error(data.error || "Failed to load usage history");
      }
    } catch (error) {
      toast.error("Failed to load usage history");
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleShowUsageHistory = () => {
    setShowUsageHistory(true);
    fetchUsageHistory();
  };

  const filterCards = () => {
    let filtered = [...cards];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (card) =>
          card.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.buyer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.order_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((card) => {
        if (statusFilter === "active") {
          return (
            card.status === "paid" &&
            card.meals_remaining > 0 &&
            new Date(card.valid_until) > now
          );
        } else if (statusFilter === "used") {
          return card.meals_remaining === 0 && card.status === "paid";
        } else if (statusFilter === "expired") {
          return new Date(card.valid_until) < now;
        } else if (statusFilter === "pending") {
          return card.status === "pending";
        }
        return true;
      });
    }

    setFilteredCards(filtered);
  };

  const copyMagicLink = (token) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/meal-card/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Magic link copied to clipboard!");
  };

  const getStatusInfo = (card) => {
    const now = new Date();
    if (card.status === "pending") {
      return { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-50", Icon: Clock };
    }
    if (new Date(card.valid_until) < now) {
      return { label: "Expired", color: "text-gray-600", bg: "bg-gray-50", Icon: XCircle };
    }
    if (card.meals_remaining === 0) {
      return { label: "Used", color: "text-gray-600", bg: "bg-gray-50", Icon: CheckCircle };
    }
    return { label: "Active", color: "text-green-600", bg: "bg-green-50", Icon: CheckCircle };
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
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Meal Cards Management
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Overview and management of all 5 Meals for Winter cards
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-gray-400" />
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
                    <XCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Expired
                      </dt>
                      <dd className="text-2xl font-bold text-gray-600">
                        {stats.expired}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-gradient-to-br from-orange-500 to-emerald-500 overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-white truncate">
                        Meals Left
                      </dt>
                      <dd className="text-2xl font-bold text-white">
                        {stats.totalMealsRemaining}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              onClick={handleShowUsageHistory}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <History className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Meals Used
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {stats.totalMealsUsed}
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
                    <option value="expired">Expired</option>
                    <option value="pending">Pending Payment</option>
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
                              {card.meals_remaining}
                            </span>
                            <span className="text-sm text-gray-500">
                              / 5 meals
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{card.buyer_name}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{card.buyer_email}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span>
                                {format(new Date(card.valid_from), "MMM d")} –{" "}
                                {format(new Date(card.valid_until), "MMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate text-xs">
                                {card.order_id}
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
                            href={`/meal-card/${card.access_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </motion.a>
                        </div>
                      </div>
                    </motion.li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Usage History Modal */}
          {showUsageHistory && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                  onClick={() => setShowUsageHistory(false)}
                />

                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative inline-block w-full max-w-4xl overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <History className="h-6 w-6 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Meal Usage History
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowUsageHistory(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                      </div>
                    ) : usageHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No usage history
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          No meals have been used yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {usageHistory.map((record) => (
                          <motion.div
                            key={record.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {record.quantity_used} meal{record.quantity_used > 1 ? "s" : ""}
                                </span>
                                <span className="text-sm text-gray-500">
                                  → {record.meals_remaining_after} left
                                </span>
                              </div>
                              <div className="text-sm text-gray-900 font-medium">
                                {record.meal_card?.buyer_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.meal_card?.buyer_email}
                              </div>
                              {record.meal_card?.order_id && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Order: {record.meal_card.order_id}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-900">
                                {format(new Date(record.used_at), "MMM d, yyyy")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(record.used_at), "h:mm a")}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => setShowUsageHistory(false)}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}

