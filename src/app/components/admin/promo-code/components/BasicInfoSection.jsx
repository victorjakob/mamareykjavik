import FormSection from "./FormSection";

export default function BasicInfoSection({ formData, setFormData }) {
  return (
    <FormSection title="Basic Information" color="orange">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promo Code *
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) =>
              setFormData({
                ...formData,
                code: e.target.value.toUpperCase(),
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="e.g., WELCOME10"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            <option value="PERCENT">Percentage</option>
            <option value="AMOUNT">Fixed Amount</option>
          </select>
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Value *
        </label>
        <input
          type="number"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          placeholder={formData.type === "PERCENT" ? "10" : "1000"}
          min="0"
          max={formData.type === "PERCENT" ? "100" : undefined}
          step={formData.type === "PERCENT" ? "1" : "100"}
          required
        />
      </div>
    </FormSection>
  );
}
