"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import ShippingInfo from "./shipping/ShippingInfo";

export default function Checkout({ cartTotal, cartItems }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [shippingCost, setShippingCost] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: user?.email || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsProcessingPayment(true);
      setError(null);

      // Calculate final amounts including shipping
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.products.price * item.quantity,
        0
      );
      const total = subtotal - couponDiscount + shippingCost;

      // Process payment through SaltPay
      const response = await fetch("/api/saltpay/shop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          buyer_email: data.email,
          buyer_name: data.fullName,
          items: [
            ...cartItems.map((item) => ({
              description: item.products.name,
              count: item.quantity,
              unitPrice: item.products.price,
              totalPrice: item.products.price * item.quantity,
            })),
            // Add shipping as a separate line item if applicable
            ...(shippingCost > 0
              ? [
                  {
                    description: "Shipping",
                    count: 1,
                    unitPrice: shippingCost,
                    totalPrice: shippingCost,
                  },
                ]
              : []),
            // Add discount as a negative line item if applicable
            ...(couponDiscount > 0
              ? [
                  {
                    description: "Discount",
                    count: 1,
                    unitPrice: -couponDiscount,
                    totalPrice: -couponDiscount,
                  },
                ]
              : []),
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment processing failed");
      }

      const paymentData = await response.json();
      if (paymentData.url) {
        window.location.href = paymentData.url;
      }
    } catch (err) {
      setError(err.message);
      console.error("Payment error:", err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError("Invalid coupon code");
    setCouponDiscount(0);
  };

  const handleDeliveryMethodChange = (value) => {
    setDeliveryMethod(value);
    if (value === "pickup") {
      setShippingCost(0);
    }
  };

  const finalTotal = cartTotal - couponDiscount + shippingCost;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-emerald-300 to-green-300">
        <h2 className="text-2xl font-bold  text-center">Complete Your Order</h2>
      </div>

      <div className="p-8">
        {/* Delivery Method Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            How would you like to receive your order?
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`
              p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
              ${
                deliveryMethod === "pickup"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-200"
              }
            `}
            >
              <input
                type="radio"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                className="hidden"
              />
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-8 h-8 mb-2 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <span className="font-medium text-gray-800">Store Pickup</span>
                <span className="text-sm text-gray-500">Ready in 2 hours</span>
              </div>
            </label>

            <label
              className={`
              p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
              ${
                deliveryMethod === "delivery"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-200"
              }
            `}
            >
              <input
                type="radio"
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                className="hidden"
              />
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-8 h-8 mb-2 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="font-medium text-gray-800">Home Delivery</span>
                <span className="text-sm text-gray-500">2-4 business days</span>
              </div>
            </label>
          </div>
        </div>

        {/* Common Form Fields */}
        <div className="space-y-4 mb-8">
          <input
            {...register("fullName", { required: "Full name is required" })}
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.fullName.message}
            </p>
          )}

          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
            disabled={!!user}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}

          <input
            {...register("phone", { required: "Phone number is required" })}
            placeholder="Phone Number"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Conditional Content Based on Delivery Method */}
        {deliveryMethod === "pickup" && (
          <div className="mb-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-gray-800">
              Welcome to our shop{" "}
              <span className="font-semibold">Mama Reykjavik</span> at
              Bankastræti 2 during our opening hours
            </p>
          </div>
        )}
        {deliveryMethod === "delivery" && (
          <ShippingInfo
            register={register}
            errors={errors}
            setShippingCost={setShippingCost}
          />
        )}

        {/* Order Summary Card */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Order Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">{cartTotal} kr</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount Applied</span>
                <span className="font-medium">-{couponDiscount} kr</span>
              </div>
            )}
            {shippingCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">{shippingCost} kr</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold text-gray-800 pt-4 border-t">
              <span>Total</span>
              <span>{finalTotal} kr</span>
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="mb-8">
          <form onSubmit={handleCouponSubmit} className="flex gap-3">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter promo code"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              Apply
            </button>
          </form>
          {couponError && (
            <p className="mt-2 text-sm text-red-500">{couponError}</p>
          )}
        </div>

        {/* Submit Button */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <button
            type="submit"
            disabled={isProcessingPayment}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isProcessingPayment ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing Payment...
              </div>
            ) : (
              "Complete Order"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
