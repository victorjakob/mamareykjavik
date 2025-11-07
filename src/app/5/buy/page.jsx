"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";

export default function BuyFiveMeals() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      email: "",
      name: "",
    },
  });

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setValue("email", session.user.email || "");
      setValue("name", session.user.name || "");
    }
  }, [session, status, setValue]);

  const translations = {
    en: {
      title: "5 Meals for Winter",
      subtitle: "Complete your purchase",
      email: "Email",
      name: "Full Name",
      enterEmail: "Enter your email address",
      enterName: "Enter your full name",
      price: "14.900 kr",
      total: "Total",
      proceedToPayment: "Proceed to Payment",
      processing: "Processing...",
      termsNote: "By continuing, you agree to our Terms of Service",
      termsLink: "Terms of Service",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      nameRequired: "Full name is required",
    },
    is: {
      title: "5 Réttir fyrir Veturinn",
      subtitle: "Ljúktu við kaupin",
      email: "Netfang",
      name: "Fullt nafn",
      enterEmail: "Sláðu inn netfangið þitt",
      enterName: "Sláðu inn fullt nafn",
      price: "14.900 kr",
      total: "Samtals",
      proceedToPayment: "Halda áfram í greiðslu",
      processing: "Vinnur...",
      termsNote: "Með því að halda áfram samþykkir þú okkar",
      termsLink: "Skilmála",
      emailRequired: "Netfang er nauðsynlegt",
      emailInvalid: "Vinsamlegast sláðu inn gilt netfang",
      nameRequired: "Fullt nafn er nauðsynlegt",
    },
  };

  const t = translations[language];
  const offerPrice = 14900;

  const onSubmit = async (data) => {
    try {
      setIsProcessingPayment(true);
      setError(null);

      const buyerEmail = session?.user?.email || data.email;
      const buyerName = session?.user?.name || data.name;

      // Process payment through SaltPay
      const response = await fetch("/api/saltpay/5-meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: offerPrice,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
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
            <h1 className="text-2xl sm:text-3xl font-light text-white text-center tracking-tighter" style={{ letterSpacing: "-0.02em" }}>
              {t.title}
            </h1>
            <p className="text-white/90 text-center mt-2 font-light">
              {t.subtitle}
            </p>
          </div>

          <div className="p-8">
            {/* Image */}
            <div className="mb-8">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md">
                <Image
                  src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1762326608/dahl_aumxpm.jpg"
                  alt="5 Meals for Winter"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-8 p-6 bg-gradient-to-br from-orange-50/50 to-emerald-50/50 rounded-xl border border-orange-100/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-light text-gray-700">
                  5 Meals for Winter
                </span>
                <span className="text-xl font-light text-gray-900 tracking-tighter" style={{ letterSpacing: "-0.02em" }}>
                  {t.price}
                </span>
              </div>
              <div className="pt-4 border-t border-orange-200/50 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  {t.total}
                </span>
                <span className="text-2xl font-light text-gray-900 tracking-tighter" style={{ letterSpacing: "-0.03em" }}>
                  {t.price}
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
                  href="/terms"
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

