"use client";

import React, { useState } from "react";

const PaymentTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSaltPayPayment = async () => {
    setLoading(true);
    setError("");

    // Dummy data for testing
    const dummyData = {
      amount: 100, // Ensure numeric with two decimal places
      currency: "ISK",
      orderId: "TEST12345678", // Must be 12 alphanumeric characters
      buyer: {
        name: "John Doe",
        email: "johndoe@example.com",
      },
      items: [
        {
          description: "Test Item",
          count: 1,
          unitAmount: 100,
          amount: 100,
        },
      ],
    };

    try {
      // API call to your SaltPay backend
      const response = await fetch("/api/saltpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dummyData),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          errorDetails.message || "Failed to generate payment form."
        );
      }

      const { action, fields } = await response.json();

      // Dynamically create and submit the payment form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = action;

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value.toString();
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Error initiating SaltPay payment:", err);
      setError(err.message || "Could not start the payment process.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleSaltPayPayment}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Processing..." : "Test SaltPay Payment"}
      </button>
    </div>
  );
};

export default PaymentTest;
