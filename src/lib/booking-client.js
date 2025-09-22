// Client-side booking utilities
export const submitBooking = async (bookingData) => {
  try {
    const response = await fetch("/api/wl/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to submit booking");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Booking submission error:", error);
    throw error;
  }
};

