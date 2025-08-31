"use client";
import { useState, useEffect } from "react";
import { useCookieConsent } from "@/providers/CookieConsentProvider";
import {
  InformationCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function CookiePreferencesManager({ isOpen, onClose }) {
  const { preferences, updatePreferences, resetPreferences } =
    useCookieConsent();

  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  }, [preferences, isOpen]);

  const handlePreferenceChange = (type, value) => {
    setLocalPreferences((prev) => ({ ...prev, [type]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    resetPreferences();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Cog6ToothIcon className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Cookie Preferences
              </h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Manage your cookie preferences and privacy settings
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        Essential Cookies
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      These cookies are necessary for the website to function
                      properly. They include authentication, security, and basic
                      functionality cookies.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.essential}
                    disabled
                    className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 ml-4"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        Analytics Cookies
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Performance
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      These cookies help us understand how visitors use our
                      website by collecting information anonymously. This helps
                      us improve our services.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Examples:</strong> Google Analytics, Vercel
                      Analytics
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.analytics}
                    onChange={(e) =>
                      handlePreferenceChange("analytics", e.target.checked)
                    }
                    className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 ml-4"
                  />
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">
                        Functional Cookies
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Convenience
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      These cookies enable enhanced functionality and
                      personalization, such as remembering your preferences,
                      cart items, and language settings.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Examples:</strong> Shopping cart, user
                      preferences, guest ID
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPreferences.functional}
                    onChange={(e) =>
                      handlePreferenceChange("functional", e.target.checked)
                    }
                    className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 ml-4"
                  />
                </div>
              </div>

              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How cookies work</p>
                    <p>
                      Cookies are small text files stored on your device.
                      Essential cookies are always active to ensure the website
                      works properly. You can enable or disable analytics and
                      functional cookies based on your preferences. Changes take
                      effect immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="w-full sm:w-auto px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2 text-red-600 hover:text-red-700 transition-colors font-medium"
            >
              Reset All Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
