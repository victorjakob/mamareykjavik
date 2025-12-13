"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/util/IskFormat";

const SHIPPING_COST = 690;

export default function BuyGiftCardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  // Get amount and delivery method from URL params
  const amountParam = searchParams.get("amount");
  const deliveryParam = searchParams.get("delivery");

  const amount = amountParam ? parseInt(amountParam, 10) : 5000;
  const deliveryMethod = deliveryParam || "email";

  const shippingCost = deliveryMethod === "mail" ? SHIPPING_COST : 0;
  const total = amount + shippingCost;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      name: "",
      recipientEmail: "",
      recipientName: "",
      address: "",
      city: "",
      zip: "",
      phone: "",
    },
  });

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setValue("email", session.user.email || "");
      setValue("name", session.user.name || "");
    }
  }, [session, status, setValue]);

  // Redirect if no amount or delivery method
  useEffect(() => {
    if (!amountParam || !deliveryParam) {
      router.push("/giftcard");
    }
  }, [amountParam, deliveryParam, router]);

  const translations = {
    en: {
      title: "Holiday Gift Card",
      subtitle: "Complete your purchase",
      amount: "Gift Card Amount",
      deliveryMethod: "Delivery Method",
      email: "Your Email",
      name: "Your Name",
      recipientEmail: "Recipient Email (Optional)",
      recipientName: "Recipient Name (Optional)",
      recipientNote:
        "If you want the gift card sent directly to someone else",
      address: "Shipping Address",
      city: "City",
      zip: "Postal Code",
      phone: "Phone Number",
      enterEmail: "Enter your email address",
      enterName: "Enter your full name",
      enterRecipientEmail: "Enter recipient email (optional)",
      enterRecipientName: "Enter recipient name (optional)",
      enterAddress: "Enter street address",
      enterCity: "Enter city",
      enterZip: "Enter postal code",
      enterPhone: "Enter phone number",
      total: "Total",
      proceedToPayment: "Proceed to Payment",
      processing: "Processing...",
      termsNote: "By continuing, you agree to our Terms of Service",
      termsLink: "Terms of Service",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      nameRequired: "Full name is required",
      addressRequired: "Shipping address is required for mail delivery",
      cityRequired: "City is required for mail delivery",
      zipRequired: "Postal code is required for mail delivery",
      phoneRequired: "Phone number is required for mail delivery",
      emailDelivery: "Email Delivery",
      pickupDelivery: "Pick Up at Store",
      mailDelivery: "Mail Delivery",
    },
    is: {
      title: "Jólagjöf",
      subtitle: "Ljúktu við kaupin",
      amount: "Gjafakort Upphæð",
      deliveryMethod: "Afhendingarmáti",
      email: "Þitt Netfang",
      name: "Þitt Nafn",
      recipientEmail: "Viðtakandi Netfang (Valfrjálst)",
      recipientName: "Viðtakandi Nafn (Valfrjálst)",
      recipientNote:
        "Ef þú vilt að gjafakortið sé sent beint til einhvers annars",
      address: "Heimilisfang",
      city: "Borg",
      zip: "Póstnúmer",
      phone: "Símanúmer",
      enterEmail: "Sláðu inn netfangið þitt",
      enterName: "Sláðu inn fullt nafn",
      enterRecipientEmail: "Sláðu inn netfang viðtakanda (valfrjálst)",
      enterRecipientName: "Sláðu inn nafn viðtakanda (valfrjálst)",
      enterAddress: "Sláðu inn heimilisfang",
      enterCity: "Sláðu inn borg",
      enterZip: "Sláðu inn póstnúmer",
      enterPhone: "Sláðu inn símanúmer",
      total: "Samtals",
      proceedToPayment: "Halda áfram í greiðslu",
      processing: "Vinnur...",
      termsNote: "Með því að halda áfram samþykkir þú okkar",
      termsLink: "Skilmála",
      emailRequired: "Netfang er nauðsynlegt",
      emailInvalid: "Vinsamlegast sláðu inn gilt netfang",
      nameRequired: "Fullt nafn er nauðsynlegt",
      addressRequired: "Heimilisfang er nauðsynlegt fyrir póstsendingu",
      cityRequired: "Borg er nauðsynleg fyrir póstsendingu",
      zipRequired: "Póstnúmer er nauðsynlegt fyrir póstsendingu",
      phoneRequired: "Símanúmer er nauðsynlegt fyrir póstsendingu",
      emailDelivery: "Tölvupóstur",
      pickupDelivery: "Afhending í Verslun",
      mailDelivery: "Póstsending",
    },
  };

  const t = translations[language];

  const onSubmit = async (data) => {
    try {
      setIsProcessingPayment(true);
      setError(null);

      const buyerEmail = session?.user?.email || data.email;
      const buyerName = session?.user?.name || data.name;

      // Prepare shipping address if mail delivery
      const shippingAddress =
        deliveryMethod === "mail"
          ? {
              address: data.address,
              city: data.city,
              zip: data.zip,
              phone: data.phone,
            }
          : null;

      // Process payment through SaltPay
      const response = await fetch("/api/saltpay/giftcard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          gift_card_amount: amount,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          recipient_email: data.recipientEmail || null,
          recipient_name: data.recipientName || null,
          delivery_method: deliveryMethod,
          shipping_address: shippingAddress,
          shipping_cost: shippingCost,
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
      toast.error(err.message || "Payment error");
      console.error("Payment error:", err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const deliveryMethodLabels = {
    email: t.emailDelivery,
    pickup: t.pickupDelivery,
    mail: t.mailDelivery,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-emerald-50/40 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-orange-500 to-emerald-500">
            <h1
              className="text-2xl sm:text-3xl font-light text-white text-center tracking-tighter"
              style={{ letterSpacing: "-0.02em" }}
            >
              {t.title}
            </h1>
            <p className="text-white/90 text-center mt-2 font-light">
              {t.subtitle}
            </p>
          </div>

          <div className="p-8">
            {/* Order Summary */}
            <div className="mb-8 p-6 bg-gradient-to-br from-orange-50/50 to-emerald-50/50 rounded-xl border border-orange-100/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-light text-gray-700">
                    {t.amount}
                  </span>
                  <span
                    className="text-xl font-light text-gray-900 tracking-tighter"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {formatPrice(amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-light text-gray-700">
                    {t.deliveryMethod}
                  </span>
                  <span className="text-lg font-light text-gray-900">
                    {deliveryMethodLabels[deliveryMethod]}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-light text-gray-700">
                      Shipping
                    </span>
                    <span
                      className="text-xl font-light text-gray-900 tracking-tighter"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {formatPrice(shippingCost)}
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-4 mt-4 border-t border-orange-200/50 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  {t.total}
                </span>
                <span
                  className="text-2xl font-light text-gray-900 tracking-tighter"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t.email}
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: t.emailRequired,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t.emailInvalid,
                    },
                  })}
                  placeholder={t.enterEmail}
                  disabled={!!session?.user}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t.name}
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name", {
                    required: t.nameRequired,
                  })}
                  placeholder={t.enterName}
                  disabled={!!session?.user}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Recipient Information (for email delivery) */}
              {deliveryMethod === "email" && (
                <>
                  <div>
                    <label
                      htmlFor="recipientEmail"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t.recipientEmail}
                    </label>
                    <input
                      id="recipientEmail"
                      type="email"
                      {...register("recipientEmail", {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t.emailInvalid,
                        },
                      })}
                      placeholder={t.enterRecipientEmail}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                    {errors.recipientEmail && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.recipientEmail.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="recipientName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t.recipientName}
                    </label>
                    <input
                      id="recipientName"
                      type="text"
                      {...register("recipientName")}
                      placeholder={t.enterRecipientName}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t.recipientNote}
                    </p>
                  </div>
                </>
              )}

              {/* Shipping Address (for mail delivery) */}
              {deliveryMethod === "mail" && (
                <>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t.address}
                    </label>
                    <input
                      id="address"
                      type="text"
                      {...register("address", {
                        required: t.addressRequired,
                      })}
                      placeholder={t.enterAddress}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t.city}
                      </label>
                      <input
                        id="city"
                        type="text"
                        {...register("city", {
                          required: t.cityRequired,
                        })}
                        placeholder={t.enterCity}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="zip"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t.zip}
                      </label>
                      <input
                        id="zip"
                        type="text"
                        {...register("zip", {
                          required: t.zipRequired,
                        })}
                        placeholder={t.enterZip}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                      />
                      {errors.zip && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.zip.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t.phone}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      {...register("phone", {
                        required: t.phoneRequired,
                      })}
                      placeholder={t.enterPhone}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center font-light">
                {t.termsNote}{" "}
                <a
                  href="/policies/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  {t.termsLink}
                </a>
              </p>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isProcessingPayment}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? t.processing : t.proceedToPayment}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

