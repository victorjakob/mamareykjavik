"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  ArrowPathIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function AutoCreditSubscriptions({
  subscriptions = [],
  onRefresh,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    monthlyAmount: "",
    description: "",
  });

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/user/auto-credit-subscriptions");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch subscriptions");
      }
      // Don't set subscriptions here since they come from props
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingId
        ? `/api/user/auto-credit-subscriptions/${editingId}`
        : "/api/user/auto-credit-subscriptions";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          monthlyAmount: parseFloat(formData.monthlyAmount),
          description: formData.description,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(
        editingId
          ? "Subscription updated successfully!"
          : "Subscription created successfully!"
      );
      setShowForm(false);
      if (onRefresh) onRefresh();
      setEditingId(null);
      setFormData({ email: "", monthlyAmount: "", description: "" });
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (subscription) => {
    setEditingId(subscription.id);
    setFormData({
      email: subscription.email,
      monthlyAmount: subscription.monthly_amount.toString(),
      description: subscription.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this subscription?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/user/auto-credit-subscriptions/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete subscription");
      }

      toast.success("Subscription deleted successfully!");
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const response = await fetch(
        `/api/user/auto-credit-subscriptions/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update subscription");
      }

      toast.success(
        `Subscription ${!isActive ? "activated" : "deactivated"} successfully!`
      );
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleProcessNow = async () => {
    if (
      !confirm(
        "This will process all overdue subscriptions immediately. Continue?"
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/process-monthly-credits", {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process subscriptions");
      }

      if (data.processed > 0) {
        toast.success(
          `Successfully processed ${data.processed} subscription(s)!`,
          { duration: 5000 }
        );
        if (data.errors && data.errors.length > 0) {
          console.error("Processing errors:", data.errors);
          toast.error(
            `${data.errors.length} subscription(s) had errors. Check console for details.`,
            { duration: 5000 }
          );
        }
      } else {
        toast.info("No subscriptions were due for processing.");
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDates = async () => {
    // Calculate 1st of next month (e.g., if today is Jan 27, target is Feb 1)
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 1);
    targetDate.setDate(1);
    targetDate.setHours(0, 0, 0, 0);

    const formattedDate = targetDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (
      !confirm(
        `This will update all overdue subscriptions' next payment date to ${formattedDate} WITHOUT processing any payments. Continue?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/reset-subscription-dates", {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset subscription dates");
      }

      if (data.updated > 0) {
        toast.success(
          `Successfully updated ${data.updated} subscription(s) to ${formattedDate}!`,
          { duration: 5000 }
        );
        if (data.errors && data.errors.length > 0) {
          console.error("Update errors:", data.errors);
          toast.error(
            `${data.errors.length} subscription(s) had errors. Check console for details.`,
            { duration: 5000 }
          );
        }
      } else {
        toast.info("No overdue subscriptions found to update.");
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <PlayIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {subscriptions.length} Subscription
            {subscriptions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleResetDates}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Update next payment date to 1st of next month without processing payments"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Reset to Next Month
          </button>
          <button
            onClick={handleProcessNow}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Process all overdue subscriptions now"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Process Now
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Subscription
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {editingId ? "Edit Subscription" : "Add New Subscription"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Amount (kr)
              </label>
              <input
                type="number"
                step="100"
                required
                value={formData.monthlyAmount}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyAmount: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Monthly allowance for John Doe"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    email: "",
                    monthlyAmount: "",
                    description: "",
                  });
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xs font-semibold text-white">
                          {subscription.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.email}
                        </div>
                        {subscription.description && (
                          <div className="text-sm text-gray-500">
                            {subscription.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {subscription.monthly_amount.toLocaleString()} kr
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleActive(
                          subscription.id,
                          subscription.is_active
                        )
                      }
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {subscription.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subscription.next_payment_date
                      ? formatDate(subscription.next_payment_date)
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subscription.last_payment_date
                      ? formatDate(subscription.last_payment_date)
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="border-b border-gray-200 p-4 last:border-b-0"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-white">
                      {subscription.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.email}
                    </div>
                    {subscription.description && (
                      <div className="text-xs text-gray-500">
                        {subscription.description}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleToggleActive(subscription.id, subscription.is_active)
                  }
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscription.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {subscription.is_active ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Amount:</span>
                  <span className="font-medium">
                    {subscription.monthly_amount.toLocaleString()} kr
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Next Payment:</span>
                  <span className="font-medium">
                    {subscription.next_payment_date
                      ? formatDate(subscription.next_payment_date)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Payment:</span>
                  <span className="font-medium">
                    {subscription.last_payment_date
                      ? formatDate(subscription.last_payment_date)
                      : "Never"}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(subscription)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <PencilIcon className="h-3 w-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(subscription.id)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {subscriptions.length === 0 && (
          <div className="text-center py-12">
            <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No subscriptions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new auto-credit subscription.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
