export default function ModalActions({
  onCancel,
  onSubmit,
  loading,
  editingPromoCode,
}) {
  return (
    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={loading}
        className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 border border-transparent rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200 shadow-lg"
      >
        {loading
          ? "Saving..."
          : editingPromoCode
            ? "Update Promo Code"
            : "Create Promo Code"}
      </button>
    </div>
  );
}
