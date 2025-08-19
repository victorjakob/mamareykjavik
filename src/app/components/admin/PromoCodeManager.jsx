"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PromoCodeModal, PromoCodeForm } from "./promo-code";

export default function PromoCodeManager({ user, events = [] }) {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState(null);
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
        // Hosts can see ALL promo codes that apply to their events
        // (whether created by admin or themselves)
        const userEventIds = events.map((event) => event.id.toString());
        filteredCodes = data.promoCodes.filter(
          (code) =>
            !code.applicable_event_ids ||
            code.applicable_event_ids.length === 0 ||
            code.applicable_event_ids.some((id) => userEventIds.includes(id))
        );
      }

      setPromoCodes(filteredCodes);
    } catch (err) {
      setError(err.message);
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
      handleCloseModal();
    } catch (err) {
      setError(err.message);
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
    } catch (err) {
      setError(err.message);
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
    setError(null);
  };

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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-800 break-words">{error}</p>
            </div>
          </div>
        </div>
      )}

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
                          {promoCode.usage?.total || 0} used
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
                          promoCode.applicable_event_ids.length === 0
                            ? "All events"
                            : `${promoCode.applicable_event_ids.length} event(s)`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {promoCode.created_by === user.id ? (
                            <span className="text-green-600 font-medium">
                              You
                            </span>
                          ) : (
                            <span className="text-blue-600 font-medium">
                              Admin
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
                          {promoCode.usage?.total || 0} used
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
                          promoCode.applicable_event_ids.length === 0
                            ? "All events"
                            : `${promoCode.applicable_event_ids.length} event(s)`}
                        </div>
                        {user.role === "host" && (
                          <div className="text-xs text-gray-500 mt-1">
                            {promoCode.created_by === user.id
                              ? "Your code"
                              : "Admin code"}
                          </div>
                        )}
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
    </div>
  );
}
