import FormSection from "./FormSection";

export default function EventSelectionSection({
  formData,
  setFormData,
  events,
  userRole,
}) {
  return (
    <FormSection title="Event Selection" color="indigo">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Applicable Events
        </label>
        <div className="space-y-3">
          {/* All Events Option */}
          <label className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.applicable_event_ids.length === 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setFormData({
                    ...formData,
                    applicable_event_ids: [],
                  });
                }
              }}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-900">
              🎯 All Events
            </span>
            <span className="ml-auto text-xs text-gray-500">
              {userRole === "admin"
                ? "Apply to all events in the system"
                : "Apply to all your events"}
            </span>
          </label>

          {/* Individual Event Options */}
          {events
            .filter((event) => new Date(event.date) >= new Date())
            .map((event) => (
              <label
                key={event.id}
                className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.applicable_event_ids.includes(
                    event.id.toString()
                  )}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        applicable_event_ids: [
                          ...formData.applicable_event_ids,
                          event.id.toString(),
                        ],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        applicable_event_ids:
                          formData.applicable_event_ids.filter(
                            (id) => id !== event.id.toString()
                          ),
                      });
                    }
                  }}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {event.name}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </label>
            ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {userRole === "admin"
            ? "Select specific events or choose 'All Events' to apply to the entire system"
            : "Select specific events or choose 'All Events' to apply to all your events"}
        </p>
      </div>
    </FormSection>
  );
}
