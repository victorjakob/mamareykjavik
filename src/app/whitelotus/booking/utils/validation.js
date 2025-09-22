// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation (basic - accepts international format)
const PHONE_REGEX = /^[\+]?[\d\s\-\(\)]{7,}$/;

// Date validation
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Main validation function for the streamlined booking flow
export const validateBookingData = (data) => {
  const errors = [];

  // Required fields for new streamlined flow
  if (data.firstTime === undefined) {
    errors.push("First time selection is required");
  }

  if (!data.services || data.services.length === 0) {
    errors.push("At least one service must be selected");
  }

  if (!data.guestCount) {
    errors.push("Guest count is required");
  }

  if (!data.dateTime?.preferred) {
    errors.push("Preferred date and time is required");
  } else if (!isValidDate(data.dateTime.preferred)) {
    errors.push("Invalid date format");
  }

  if (!data.roomSetup) {
    errors.push("Room setup preference is required");
  }

  if (!data.tablecloth) {
    errors.push("Tablecloth preference is required");
  }

  // Contact validation
  if (!data.contact) {
    errors.push("Contact information is required");
  } else {
    if (!data.contact.name || data.contact.name.length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!data.contact.email) {
      errors.push("Email is required");
    } else if (!EMAIL_REGEX.test(data.contact.email)) {
      errors.push("Invalid email format");
    }

    if (!data.contact.phone) {
      errors.push("Phone number is required");
    } else if (!PHONE_REGEX.test(data.contact.phone)) {
      errors.push("Invalid phone number format");
    }
  }

  // Conditional validation for event manager
  if (data.eventManager?.needed === true) {
    if (!data.eventManager.contact?.name) {
      errors.push("Event manager name is required");
    }
    if (!data.eventManager.contact?.phone) {
      errors.push("Event manager phone is required");
    }
  }

  // Sanitize text inputs
  if (data.notes) {
    data.notes = sanitizeText(data.notes);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Sanitize text input to prevent XSS
export const sanitizeText = (text) => {
  if (typeof text !== "string") return "";

  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
};

// Validate individual fields
export const validateField = (field, value) => {
  switch (field) {
    case "email":
      return EMAIL_REGEX.test(value) ? null : "Invalid email format";

    case "phone":
      return PHONE_REGEX.test(value) ? null : "Invalid phone format";

    case "name":
      return value && value.length >= 2
        ? null
        : "Name must be at least 2 characters";

    case "date":
      return isValidDate(value) ? null : "Invalid date format";

    default:
      return null;
  }
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // Icelandic format: +354 XXX XXXX
  if (digits.startsWith("354") && digits.length === 10) {
    return `+354 ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  // Local Icelandic format: XXX XXXX
  if (digits.length === 7) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }

  return phone;
};

// Parse date from input
export const parseDateTime = (dateInput, timeInput) => {
  if (!dateInput) return null;

  const date = new Date(dateInput);
  if (timeInput) {
    const [hours, minutes] = timeInput.split(":");
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  }

  return date.toISOString();
};
