"use client";

import FormSection from "./components/FormSection";
import BasicInfoSection from "./components/BasicInfoSection";
import EventSelectionSection from "./components/EventSelectionSection";
import ModalActions from "./components/ModalActions";

export default function PromoCodeForm({
  formData,
  setFormData,
  events,
  userRole,
  onSubmit,
  onCancel,
  loading,
  editingPromoCode,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <BasicInfoSection formData={formData} setFormData={setFormData} />

      {/* Usage Limits */}
      <FormSection title="Usage Limits" color="blue">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Uses (optional)
            </label>
            <input
              type="number"
              value={formData.max_uses}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_uses: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Unlimited"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited uses
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Per User Limit
            </label>
            <input
              type="number"
              value={formData.per_user_limit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  per_user_limit: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              min="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              How many times each user can use this code
            </p>
          </div>
        </div>
      </FormSection>

      {/* Validity Period */}
      <FormSection title="Validity Period" color="green">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.start_at}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  start_at: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date (optional)
            </label>
            <input
              type="datetime-local"
              value={formData.end_at}
              onChange={(e) =>
                setFormData({ ...formData, end_at: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </FormSection>

      {/* Cart Requirements */}
      <FormSection title="Cart Requirements" color="purple">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Cart Total (ISK)
          </label>
          <input
            type="number"
            value={formData.min_cart_total}
            onChange={(e) =>
              setFormData({
                ...formData,
                min_cart_total: e.target.value,
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="0"
            min="0"
            step="100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum amount required in cart to apply this code
          </p>
        </div>
      </FormSection>

      {/* Event Selection */}
      <EventSelectionSection
        formData={formData}
        setFormData={setFormData}
        events={events}
        userRole={userRole}
      />

      {/* Status */}
      <FormSection title="Status" color="yellow">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({
                ...formData,
                is_active: e.target.checked,
              })
            }
            className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is_active"
            className="ml-2 block text-lg font-medium text-gray-900"
          >
            Active
          </label>
          <p className="ml-3 text-sm text-gray-500">
            Enable this promo code for immediate use
          </p>
        </div>
      </FormSection>

      {/* Actions */}
      <ModalActions
        onCancel={onCancel}
        onSubmit={onSubmit}
        loading={loading}
        editingPromoCode={editingPromoCode}
      />
    </form>
  );
}
