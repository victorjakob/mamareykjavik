"use client";
import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabase/client";
import DeliveryMethodSelector from "./components/DeliveryMethodSelector";
import DeliveryAddressFields from "./components/DeliveryAddressFields";
import ShippingOptions from "./components/ShippingOptions";
import OrderSummary from "./components/OrderSummary";
import CouponField from "./components/CouponField";
import PaymentButton from "./components/PaymentButton";
import { toast } from "react-hot-toast";

// Capital area zip codes
const capitalAreaPostcodes = [
  "101",
  "102",
  "103",
  "104",
  "105",
  "107",
  "108",
  "109",
  "110",
  "111",
  "112",
  "113",
  "116",
  "121",
  "123",
  "124",
  "125",
  "126",
  "127",
  "128",
  "129",
  "130",
  "132",
  "150",
  "155",
  "170",
  "172",
  "200",
  "201",
  "202",
  "203",
  "210",
  "212",
  "220",
  "221",
  "222",
  "225",
  "270",
  "271",
  "276",
];

function isCapitalArea(zip) {
  return capitalAreaPostcodes.includes(zip);
}

export default function Checkout({ cartTotal, cartItems, user, cartId }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [shippingCost, setShippingCost] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const [shippingOption, setShippingOption] = useState("");
  const [shippingOptionError, setShippingOptionError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: user?.email || "",
      fullName: user?.name || "",
      // address: user?.address || "",
      // phone: user?.phone || "",
    },
  });

  // Watch zip code for delivery
  const zip = watch("zip");
  const address = watch("address");
  const city = watch("city");

  // Show shipping options only if zip, address, and city are filled for delivery
  const showShippingOptions =
    deliveryMethod === "delivery" && zip && address && city;

  // Calculate shipping cost based on option and zip
  function getShippingCost(option, zip) {
    if (!option || !zip) return 0;
    const isCapital = isCapitalArea(zip);
    if (option === "location") {
      return isCapital ? 790 : 990;
    } else if (option === "home") {
      return isCapital ? 1350 : 1450;
    }
    return 0;
  }

  // Update shipping cost when shipping option or zip changes
  React.useEffect(() => {
    if (deliveryMethod === "delivery" && shippingOption && zip) {
      setShippingCost(getShippingCost(shippingOption, zip));
    } else if (deliveryMethod === "pickup") {
      setShippingCost(0);
    }
  }, [shippingOption, zip, deliveryMethod]);

  const onSubmit = async (data) => {
    try {
      setIsProcessingPayment(true);
      setError(null);

      // If delivery and no shipping option selected, show error and prevent submit
      if (deliveryMethod === "delivery" && !shippingOption) {
        toast.error("Please select a shipping option.");
        return;
      } else {
        setShippingOptionError("");
      }

      // Calculate final amounts including shipping
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.products.price * item.quantity,
        0
      );
      const total = subtotal - couponDiscount + shippingCost;

      // Handle 100% discount case - create order directly without payment
      if (total === 0) {
        try {
          const normalizedEmail = data.email?.trim().toLowerCase() || null;
          let linkedUserEmail = null;

          if (normalizedEmail) {
            const { data: profileMatch, error: profileError } = await supabase
              .from("profiles")
              .select("email")
              .eq("email", normalizedEmail)
              .maybeSingle();

            if (profileError) {
              if (profileError.code === "42P01") {
                console.warn(
                  "[Checkout] profiles table not found; proceeding without linking user_email"
                );
              } else if (profileError.code !== "PGRST116") {
                throw profileError;
              }
            }

            if (profileMatch?.email) {
              linkedUserEmail = profileMatch.email;
            }
          }

          // Create the order directly
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
              user_email: linkedUserEmail,
              price: 0,
              delivery: deliveryMethod === "delivery",
              shipping_info: {
                address: address || "",
                city: city || "",
                zip: zip || "",
                phone: data.phone || "",
                method: deliveryMethod,
                shippingOption,
                shippingCost: 0,
                contactEmail: normalizedEmail,
                contactName: data.fullName?.trim() || null,
              },
              cart_id: cartId,
              payment_status: "paid", // Mark as paid since it's free
            })
            .select("id")
            .single();

          if (orderError) throw orderError;

          // Mark cart as paid
          const { error: cartError } = await supabase
            .from("carts")
            .update({ status: "paid" })
            .eq("id", cartId);

          if (cartError) {
            console.error("Failed to update cart status:", cartError);
          }

          // Create order items
          const orderItemsToInsert = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.products?.name || null,
            product_price: item.products?.price || item.price || null,
            quantity: item.quantity,
            unit_price: item.products?.price || item.price || null,
            total_price:
              (item.products?.price || item.price || 0) * item.quantity,
          }));

          const { error: orderItemsError } = await supabase
            .from("order_items")
            .insert(orderItemsToInsert);

          if (orderItemsError) {
            console.error("Failed to insert order items:", orderItemsError);
          }

          // Redirect to success page
          router.push("/shop/success");
          return;
        } catch (err) {
          toast.error("Failed to create free order: " + err.message);
          console.error("Free order creation error:", err);
          return;
        }
      }

      // Process payment through SaltPay for paid orders
      const response = await fetch("/api/saltpay/shop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          buyer_email: data.email,
          buyer_name: data.fullName,
          cart_id: cartId,
          shipping_info: {
            address: address || "",
            city: city || "",
            zip: zip || "",
            phone: data.phone || "",
            method: deliveryMethod,
            shippingOption,
            shippingCost,
            contactEmail: data.email?.trim().toLowerCase() || null,
            contactName: data.fullName?.trim() || null,
          },
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
      toast.error(err.message || "Payment error");
      setError(err.message);
      console.error("Payment error:", err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponDiscount(0);
    toast.error("Invalid coupon code");
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
        <DeliveryMethodSelector
          value={deliveryMethod}
          onChange={handleDeliveryMethodChange}
        />

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

          <DeliveryAddressFields
            register={register}
            errors={errors}
            deliveryMethod={deliveryMethod}
          />
          <ShippingOptions
            zip={zip}
            shippingOption={shippingOption}
            onChange={setShippingOption}
            show={showShippingOptions}
          />
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

        {/* Show order summary only if pickup, or if delivery and all address fields are filled */}
        {(deliveryMethod === "pickup" ||
          (deliveryMethod === "delivery" &&
            !!(
              typeof window !== "undefined" &&
              document.querySelector('[name="address"]')?.value &&
              document.querySelector('[name="zip"]')?.value &&
              document.querySelector('[name="city"]')?.value
            ))) && (
          <OrderSummary
            cartTotal={cartTotal}
            couponDiscount={couponDiscount}
            shippingCost={shippingCost}
            finalTotal={finalTotal}
          />
        )}

        <CouponField
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          onApply={handleCouponSubmit}
          couponError={couponError}
        />

        {/* Submit Button */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <PaymentButton
            isProcessing={isProcessingPayment}
            disabled={isProcessingPayment}
          >
            Proceed to Payment
          </PaymentButton>
          {shippingOptionError && (
            <div className="mt-2 text-sm text-red-500 text-center">
              {shippingOptionError}
            </div>
          )}
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
