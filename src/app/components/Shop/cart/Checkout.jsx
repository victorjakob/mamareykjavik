"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ShippingInfo from "./shipping/ShippingInfo";

export default function Checkout({ cartTotal, cartItems }) {
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError("Invalid coupon code");
    setCouponDiscount(0);
  };

  const finalTotal = cartTotal - couponDiscount;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-green-600">
        <h2 className="text-2xl font-bold text-white text-center">
          Complete Your Order
        </h2>
      </div>

      <div className="p-8">
        {/* Order Summary Card */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Order Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">${cartTotal.toFixed(2)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount Applied</span>
                <span className="font-medium">
                  -${couponDiscount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold text-gray-800 pt-4 border-t">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
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
                onChange={(e) => setDeliveryMethod(e.target.value)}
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
                onChange={(e) => setDeliveryMethod(e.target.value)}
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

        {/* Delivery Form */}
        {deliveryMethod === "delivery" && <ShippingInfo onSubmit={onSubmit} />}

        {/* Pickup Form */}
        {deliveryMethod === "pickup" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
                {...register("phone", { required: "Phone number is required" })}
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Complete Order
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
