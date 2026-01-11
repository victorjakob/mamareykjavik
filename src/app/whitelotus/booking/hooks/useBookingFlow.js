import { useState, useEffect, useCallback, useMemo } from "react";

// New streamlined step definitions with conditional logic
const STEPS = [
  { id: "welcome", component: "WelcomeQuestion" },
  { id: "contact", component: "ContactQuestion" },
  // { id: "firstTime", component: "FirstTimeQuestion" }, // Temporarily disabled
  { id: "dateTime", component: "DateTimeQuestion" },
  { id: "services", component: "ServicesQuestion" },
  {
    id: "food",
    component: "FoodQuestion",
    condition: (data) =>
      data.services?.includes("food") && !data.services?.includes("neither"),
  },
  {
    id: "drinks",
    component: "DrinksQuestion",
    condition: (data) =>
      data.services?.includes("drinks") && !data.services?.includes("neither"),
  },
  { id: "guestCount", component: "GuestCountQuestion" },
  { id: "techAndMusic", component: "TechAndMusicQuestion" },
  { id: "roomSetup", component: "RoomSetupQuestion" },
  {
    id: "tablecloth",
    component: "TableclothQuestion",
    condition: (data) =>
      data.roomSetup === "seated" || data.roomSetup === "mixed",
  },
  { id: "notes", component: "NotesQuestion" },
  { id: "review", component: "ReviewQuestion" },
];

const STORAGE_KEY = "wl-booking-data";

export function useBookingFlow() {
  const [formData, setFormData] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepHistory, setStepHistory] = useState([0]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error("Failed to parse saved booking data:", error);
      }
    }
  }, []);

  // Auto-save form data (debounced to prevent scroll glitches)
  useEffect(() => {
    if (Object.keys(formData).length === 0) return;
    
    // Debounce localStorage writes to prevent scroll position jumps
    const timeoutId = setTimeout(() => {
      try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error("Failed to save booking data:", error);
    }
    }, 300); // 300ms debounce delay
    
    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Calculate active steps based on conditional logic
  const activeSteps = useMemo(() => {
    return STEPS.filter((step) => {
      if (!step.condition) return true;
      return step.condition(formData);
    });
  }, [formData]);

  const totalSteps = activeSteps.length;
  const currentStep = activeSteps[currentStepIndex];

  // Update form data
  const updateFormData = useCallback((updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
      // Add metadata
      metadata: {
        ...prev.metadata,
        locale: prev.metadata?.locale || "is-IS",
        lastUpdated: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    }));
  }, []);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < activeSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setStepHistory((prev) => [...prev, nextIndex]);
    }
  }, [currentStepIndex, activeSteps.length]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setStepHistory((prev) => prev.slice(0, -1));
    }
  }, [currentStepIndex]);

  // Navigation state
  const canGoBack = currentStepIndex > 1;
  const canContinue = useMemo(() => {
    if (!currentStep) return false;

    // Check if current step has required data
    switch (currentStep.id) {
      case "welcome":
        return true;
      case "contact":
        return !!(
          formData.contact?.name &&
          formData.contact?.email &&
          formData.contact?.phone
        );
      case "firstTime":
        return formData.firstTime !== undefined;
      case "services":
        if (!formData.services || formData.services.length === 0) {
          return false;
        }
        // Both agreements must always be accepted regardless of service selection
        return !!(
          formData.staffCostAcknowledged && formData.noOwnAlcoholConfirmed
        );
      case "food":
        return !!formData.food;
      case "drinks":
        return !!formData.drinks;
      case "eventManager":
        return !!(formData.entertainment && formData.entertainment.length > 0);
      case "guestCount":
        return !!formData.guestCount;
      case "techAndMusic":
        return true; // Optional step
      case "roomSetup":
        return !!formData.roomSetup;
      case "tablecloth":
        // Optional step - always allow continue
        return true;
      case "dateTime":
        return !!formData.dateTime?.preferred;
      case "notes":
        return true; // Optional
      case "review":
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  // Get current question component
  const getCurrentQuestion = useCallback(() => {
    if (!currentStep) return null;
    return currentStep.component;
  }, [currentStep]);

  // Check if form is complete
  const isComplete = useMemo(() => {
    const required = [
      "contact",
      // "firstTime", // Disabled - not in flow
      "services",
      "guestCount",
      "roomSetup",
      "dateTime",
    ];

    // Tablecloth is optional, so we don't require it

    return required.every((field) => {
      if (field === "contact") {
        return (
          formData.contact?.name &&
          formData.contact?.email &&
          formData.contact?.phone
        );
      }
      if (field === "services") {
        return formData.services && formData.services.length > 0;
      }
      return formData[field] !== undefined;
    });
  }, [formData]);

  // Clear saved data
  const clearData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({});
    setCurrentStepIndex(0);
    setStepHistory([0]);
  }, []);

  return {
    currentStep,
    currentStepIndex,
    totalSteps,
    formData,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    canContinue,
    getCurrentQuestion,
    isComplete,
    clearData,
    activeSteps,
  };
}
