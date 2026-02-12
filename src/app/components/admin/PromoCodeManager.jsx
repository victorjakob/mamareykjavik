"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PromoCodeModal, PromoCodeForm } from "./promo-code";
import { toast } from "react-hot-toast";

export default function PromoCodeManager({ user, events = [] }) {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    max_uses: "",
    per_user_limit: "1",
    start_at: new Date().toISOString().slice(0, 16),
    end_at: "",
    min_cart_total: "0",
    applicable_event_ids: [],
    is_active: true,
  });

  // Fetch promo codes on component mount
  const fetchPromoCodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/promo-codes");

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to manage promo codes");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to manage promo codes");
        } else {
          throw new Error("Failed to fetch promo codes");
        }
      }

      const data = await response.json();

      // Filter promo codes based on user role
      let filteredCodes = data.promoCodes;
      if (user.role === "host") {
        // Hosts should ONLY see promo codes created by themselves
        filteredCodes = data.promoCodes.filter((code) => code.created_by === user.id);
      }

      setPromoCodes(filteredCodes);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.role, events]);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const url = editingPromoCode
        ? `/api/admin/promo-codes/${editingPromoCode.id}`
        : "/api/admin/promo-codes";

      const method = editingPromoCode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          per_user_limit: parseInt(formData.per_user_limit),
          min_cart_total: parseFloat(formData.min_cart_total),
          applicable_event_ids:
            formData.applicable_event_ids.length > 0
              ? formData.applicable_event_ids
              : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error("Please log in to manage promo codes");
        } else if (response.status === 403) {
          throw new Error(
            errorData.error ||
              "You don't have permission to perform this action"
          );
        } else {
          throw new Error(errorData.error || "Failed to save promo code");
        }
      }

      await fetchPromoCodes();
      toast.success(
        editingPromoCode
          ? "Promo code updated successfully!"
          : "Promo code created successfully!"
      );
      handleCloseModal();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promo code?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error("Please log in to manage promo codes");
        } else if (response.status === 403) {
          throw new Error(
            errorData.error ||
              "You don't have permission to perform this action"
          );
        } else {
          throw new Error(errorData.error || "Failed to delete promo code");
        }
      }

      await fetchPromoCodes();
      toast.success("Promo code deleted successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promoCode) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value.toString(),
      max_uses: promoCode.max_uses?.toString() || "",
      per_user_limit: promoCode.per_user_limit?.toString() || "1",
      start_at: promoCode.start_at
        ? new Date(promoCode.start_at).toISOString().slice(0, 16)
        : "",
      end_at: promoCode.end_at
        ? new Date(promoCode.end_at).toISOString().slice(0, 16)
        : "",
      min_cart_total: promoCode.min_cart_total?.toString() || "0",
      applicable_event_ids: promoCode.applicable_event_ids || [],
      is_active: promoCode.is_active,
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingPromoCode(null);
    setFormData({
      code: "",
      type: "PERCENT",
      value: "",
      max_uses: "",
      per_user_limit: "1",
      start_at: new Date().toISOString().slice(0, 16),
      end_at: "",
      min_cart_total: "0",
      applicable_event_ids: [],
      is_active: true,
    });
  };

  const handleShowUsage = (promoCode) => {
    setSelectedPromoCode(promoCode);
    setShowUsageModal(true);
  };

  const handleCloseUsageModal = () => {
    setShowUsageModal(false);
    setSelectedPromoCode(null);
  };

  const handleShowEvents = (promoCode) => {
    setSelectedPromoCode(promoCode);
    setShowEventsModal(true);
  };

  const handleCloseEventsModal = () => {
    setShowEventsModal(false);
    setSelectedPromoCode(null);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeTooltip && !event.target.closest(".tooltip-container")) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeTooltip]);

  const formatDiscount = (type, value) => {
    return type === "PERCENT" ? `${value}% off` : `${value} ISK off`;
  };

  const getStatusBadge = (promoCode) => {
    const now = new Date();
    const startDate = new Date(promoCode.start_at);
    const endDate = promoCode.end_at ? new Date(promoCode.end_at) : null;

    if (!promoCode.is_active) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          Inactive
        </span>
      );
    }

    if (now < startDate) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          Pending
        </span>
      );
    }

    if (endDate && now > endDate) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Expired
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Active
      </span>
    );
  };

  if (loading && promoCodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promo Codes</h2>
          <p className="text-gray-600 mt-1">
            Manage promotional codes for your events
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={fetchPromoCodes}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Coupon
          </button>
        </div>
      </div>

      {/* Promo Codes List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {promoCodes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No promo codes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new promotional code.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Events
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promoCodes.map((promoCode) => (
                    <tr key={promoCode.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {promoCode.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDiscount(promoCode.type, promoCode.value)}
                        </div>
                        {promoCode.min_cart_total > 0 && (
                          <div className="text-xs text-gray-500">
                            Min: {promoCode.min_cart_total} ISK
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(promoCode)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {promoCode.usage?.total > 0 ? (
                            <span
                              className="cursor-help underline decoration-dotted"
                              onClick={() => handleShowUsage(promoCode)}
                            >
                              {promoCode.usage.total} used
                            </span>
                          ) : (
                            "0 used"
                          )}
                        </div>
                        {promoCode.max_uses && (
                          <div className="text-xs text-gray-500">
                            Max: {promoCode.max_uses}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {!promoCode.applicable_event_ids ||
                          promoCode.applicable_event_ids.length === 0 ? (
                            user.role === "host" ? "All my events" : "All events"
                          ) : (
                            <div className="group relative">
                              <span
                                className="cursor-help underline decoration-dotted"
                                onClick={() => handleShowEvents(promoCode)}
                              >
                                {promoCode.applicable_event_ids.length} event(s)
                              </span>
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg py-2 px-3 z-10 min-w-[200px] shadow-lg">
                                <div className="font-medium mb-1">
                                  Applicable Events:
                                </div>
                                {promoCode.applicable_event_ids.map(
                                  (eventId) => {
                                    const event = events.find(
                                      (e) => e.id.toString() === eventId
                                    );
                                    return (
                                      <div
                                        key={eventId}
                                        className="text-gray-200"
                                      >
                                        {event ? (
                                          <div>
                                            <span className="font-medium">
                                              {event.name}
                                            </span>
                                            <span className="text-gray-300 ml-2">
                                              {new Date(
                                                event.date
                                              ).toLocaleDateString()}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-gray-400">
                                            Event ID: {eventId} (not found)
                                          </span>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {promoCode.created_by === user.id ? (
                            <span className="text-green-600 font-medium">
                              You
                            </span>
                          ) : promoCode.creator ? (
                            <div>
                              <span className="text-blue-600 font-medium">
                                {promoCode.creator.name ||
                                  promoCode.creator.email}
                              </span>
                              <div className="text-xs text-gray-500">
                                {promoCode.creator.role}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 font-medium">
                              Unknown
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(promoCode)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(promoCode.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {promoCodes.map((promoCode) => (
                  <div key={promoCode.id} className="p-4 hover:bg-gray-50">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {promoCode.code}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatDiscount(promoCode.type, promoCode.value)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          onClick={() => handleEdit(promoCode)}
                          className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(promoCode.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <div className="mt-1">{getStatusBadge(promoCode)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Usage:</span>
                        <div className="mt-1 font-medium">
                          {promoCode.usage?.total > 0 ? (
                            <span
                              className="cursor-help underline decoration-dotted"
                              onClick={() => handleShowUsage(promoCode)}
                            >
                              {promoCode.usage.total} used
                            </span>
                          ) : (
                            "0 used"
                          )}
                          {promoCode.max_uses && (
                            <span className="text-gray-500 ml-1">
                              / {promoCode.max_uses}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Events:</span>
                        <div className="mt-1 font-medium">
                          {!promoCode.applicable_event_ids ||
                          promoCode.applicable_event_ids.length === 0 ? (
                            "All events"
                          ) : (
                            <div className="group relative">
                              <span
                                className="cursor-help underline decoration-dotted"
                                onClick={() => handleShowEvents(promoCode)}
                              >
                                {promoCode.applicable_event_ids.length} event(s)
                              </span>
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg py-2 px-3 z-10 min-w-[200px] shadow-lg">
                                <div className="font-medium mb-1">
                                  Applicable Events:
                                </div>
                                {promoCode.applicable_event_ids.map(
                                  (eventId) => {
                                    const event = events.find(
                                      (e) => e.id.toString() === eventId
                                    );
                                    return (
                                      <div
                                        key={eventId}
                                        className="text-gray-200"
                                      >
                                        {event ? (
                                          <div>
                                            <span className="font-medium">
                                              {event.name}
                                            </span>
                                            <span className="text-gray-300 ml-2">
                                              {new Date(
                                                event.date
                                              ).toLocaleDateString()}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-gray-400">
                                            Event ID: {eventId} (not found)
                                          </span>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Created By:</span>
                        <div className="mt-1 font-medium">
                          {promoCode.created_by === user.id ? (
                            <span className="text-green-600">You</span>
                          ) : promoCode.creator ? (
                            <div>
                              <span className="text-blue-600">
                                {promoCode.creator.name ||
                                  promoCode.creator.email}
                              </span>
                              <div className="text-xs text-gray-500">
                                {promoCode.creator.role}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Unknown</span>
                          )}
                        </div>
                      </div>
                      {promoCode.min_cart_total > 0 && (
                        <div>
                          <span className="text-gray-500">Min Cart:</span>
                          <div className="mt-1 font-medium">
                            {promoCode.min_cart_total} ISK
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <PromoCodeModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        editingPromoCode={editingPromoCode}
      >
        <PromoCodeForm
          formData={formData}
          setFormData={setFormData}
          events={events}
          userRole={user.role}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={loading}
          editingPromoCode={editingPromoCode}
        />
      </PromoCodeModal>

      {/* Usage Details Modal */}
      {showUsageModal && selectedPromoCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Promo Code Usage Details
                </h3>
                <button
                  onClick={handleCloseUsageModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Code:{" "}
                <span className="font-mono font-medium">
                  {selectedPromoCode.code}
                </span>
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {selectedPromoCode.usage.redemptions.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    {selectedPromoCode.usage.redemptions.length} user
                    {selectedPromoCode.usage.redemptions.length !== 1
                      ? "s"
                      : ""}{" "}
                    used this promo code
                  </div>
                  {selectedPromoCode.usage.redemptions.map(
                    (redemption, index) => {
                      const user = redemption.users;
                      const date = new Date(redemption.redeemed_at);
                      const discount = redemption.amount_discounted;

                      return (
                        <div
                          key={redemption.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {user
                                  ? user.name || user.email
                                  : `User ID: ${redemption.user_id}`}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {date.toLocaleDateString()} at{" "}
                                {date.toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">
                                -{discount} ISK
                              </div>
                              <div className="text-xs text-gray-500">saved</div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg">
                    No usage data available
                  </div>
                  <div className="text-gray-500 text-sm mt-2">
                    This promo code hasn&apos;t been used yet
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseUsageModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Details Modal */}
      {showEventsModal && selectedPromoCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Applicable Events
                </h3>
                <button
                  onClick={handleCloseEventsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Code:{" "}
                <span className="font-mono font-medium">
                  {selectedPromoCode.code}
                </span>
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {!selectedPromoCode.applicable_event_ids ||
              selectedPromoCode.applicable_event_ids.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-green-600 text-lg font-medium mb-2">
                    🎯 {user.role === "host" ? "All My Events" : "All Events"}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {user.role === "host"
                      ? "This promo code applies to all of your events"
                      : "This promo code applies to all events in the system"}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    {selectedPromoCode.applicable_event_ids.length} event
                    {selectedPromoCode.applicable_event_ids.length !== 1
                      ? "s"
                      : ""}{" "}
                    this promo code applies to
                  </div>
                  {selectedPromoCode.applicable_event_ids.map((eventId) => {
                    const event = events.find(
                      (e) => e.id.toString() === eventId
                    );
                    const isPastEvent =
                      event && new Date(event.date) < new Date();

                    return (
                      <div
                        key={eventId}
                        className={`bg-gray-50 rounded-lg p-4 border ${
                          isPastEvent
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {event ? event.name : `Event ID: ${eventId}`}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {event ? (
                                <>
                                  {new Date(event.date).toLocaleDateString()}
                                  {isPastEvent && (
                                    <span className="ml-2 text-yellow-600 text-xs font-medium">
                                      (Past Event)
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-red-500 text-xs">
                                  Event not found
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {event ? (
                              <div
                                className={`text-sm font-medium ${
                                  isPastEvent
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }`}
                              >
                                {isPastEvent ? "Past" : "Active"}
                              </div>
                            ) : (
                              <div className="text-sm text-red-500 font-medium">
                                Missing
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseEventsModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
