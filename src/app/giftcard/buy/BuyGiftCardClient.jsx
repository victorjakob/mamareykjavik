"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  Gift,
  Mail,
  Send,
  Store,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/util/IskFormat";
import PageBackground from "@/app/components/ui/PageBackground";

const ACCENT = "#ff914d";
const SHIPPING_COST = 690;

export default function BuyGiftCardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

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
  } = useForm({
    defaultValues: {
      email: "",
      name: "",
      address: "",
      city: "",
      zip: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setValue("email", session.user.email || "");
      setValue("name", session.user.name || "");
    }
  }, [session, status, setValue]);

  useEffect(() => {
    if (!amountParam || !deliveryParam) {
      router.push("/giftcard");
    }
  }, [amountParam, deliveryParam, router]);

  const t = translations[language] || translations.en;

  const deliveryMeta = {
    email: { icon: Mail, label: t.emailDelivery },
    pickup: { icon: Store, label: t.pickupDelivery },
    mail: { icon: Send, label: t.mailDelivery },
  };

  const DeliveryIcon = deliveryMeta[deliveryMethod]?.icon || Mail;

  const onSubmit = async (data) => {
    try {
      setIsProcessingPayment(true);
      setError(null);

      const buyerEmail = session?.user?.email || data.email;
      const buyerName = session?.user?.name || data.name;

      const shippingAddress =
        deliveryMethod === "mail"
          ? {
              address: data.address,
              city: data.city,
              zip: data.zip,
              phone: data.phone,
            }
          : null;

      const response = await fetch("/api/saltpay/giftcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          gift_card_amount: amount,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          recipient_email: null,
          recipient_name: null,
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

  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24 pt-28"
      data-navbar-theme="dark"
    >
      <PageBackground />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[400px] bg-[#1a1410]"
      />

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#ff914d]/50" />
          <span
            className="text-[10px] uppercase tracking-[0.45em]"
            style={{ color: ACCENT }}
          >
            {t.eyebrow}
          </span>
          <span className="h-px w-8 bg-[#ff914d]/50" />
        </div>
        <h1
          className="font-cormorant italic font-light leading-[0.96] text-[#f0ebe3]"
          style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.6rem)" }}
        >
          {t.title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-[#c4b8aa]">
          {t.subtitle}
        </p>
      </section>

      {/* CARD */}
      <section className="relative z-10 mx-auto mt-10 max-w-2xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2rem] bg-[#fffaf5] p-6 ring-1 ring-[#eadfd2] shadow-[0_24px_80px_-30px_rgba(20,12,6,0.45)] sm:p-8"
        >
          {/* Order summary */}
          <div className="mb-7 rounded-2xl border border-[#eadfd2] bg-white/70 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: `${ACCENT}14`, color: ACCENT }}
              >
                <DeliveryIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.32em] text-[#9a7a62]">
                  {t.deliveryMethod}
                </div>
                <div className="text-sm font-semibold text-[#2c1810]">
                  {deliveryMeta[deliveryMethod]?.label}
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#eadfd2] pt-3">
              <SummaryRow label={t.amount} value={formatPrice(amount)} />
              {shippingCost > 0 && (
                <SummaryRow
                  label={t.shipping}
                  value={formatPrice(shippingCost)}
                />
              )}
              <div className="mt-3 flex items-center justify-between border-t border-[#eadfd2] pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a7a62]">
                  {t.total}
                </span>
                <span className="font-cormorant italic text-3xl text-[#1a1410]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.email} error={errors.email?.message}>
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
                  className={fieldClass(errors.email, !!session?.user)}
                />
              </Field>

              <Field label={t.name} error={errors.name?.message}>
                <input
                  id="name"
                  type="text"
                  {...register("name", { required: t.nameRequired })}
                  placeholder={t.enterName}
                  disabled={!!session?.user}
                  className={fieldClass(errors.name, !!session?.user)}
                />
              </Field>
            </div>

            {deliveryMethod === "mail" && (
              <>
                <Field label={t.address} error={errors.address?.message}>
                  <input
                    id="address"
                    type="text"
                    {...register("address", { required: t.addressRequired })}
                    placeholder={t.enterAddress}
                    className={fieldClass(errors.address)}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t.city} error={errors.city?.message}>
                    <input
                      id="city"
                      type="text"
                      {...register("city", { required: t.cityRequired })}
                      placeholder={t.enterCity}
                      className={fieldClass(errors.city)}
                    />
                  </Field>
                  <Field label={t.zip} error={errors.zip?.message}>
                    <input
                      id="zip"
                      type="text"
                      {...register("zip", { required: t.zipRequired })}
                      placeholder={t.enterZip}
                      className={fieldClass(errors.zip)}
                    />
                  </Field>
                </div>

                <Field label={t.phone} error={errors.phone?.message}>
                  <input
                    id="phone"
                    type="tel"
                    {...register("phone", { required: t.phoneRequired })}
                    placeholder={t.enterPhone}
                    className={fieldClass(errors.phone)}
                  />
                </Field>
              </>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <p className="text-center text-[11px] text-[#9a7a62]">
              {t.termsNote}{" "}
              <a
                href="/policies/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#ff914d] underline-offset-2 hover:underline"
              >
                {t.termsLink}
              </a>
            </p>

            <motion.button
              type="submit"
              disabled={isProcessingPayment}
              whileHover={{ scale: isProcessingPayment ? 1 : 1.005 }}
              whileTap={{ scale: 0.985 }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff914d] px-8 py-4 text-sm font-semibold text-[#1a1410] transition-colors duration-200 hover:bg-[#ff914d]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessingPayment ? (
                <>
                  <Spinner /> {t.processing}
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" /> {t.proceedToPayment}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6f5a49]">{label}</span>
      <span className="font-semibold text-[#2c1810]">{value}</span>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block pl-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a7a62]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block pl-1 text-[11px] text-red-500">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function fieldClass(error, disabled = false) {
  return [
    "w-full rounded-2xl border px-4 py-3.5 text-sm text-[#2c1810] outline-none transition-all duration-200 placeholder:text-[#b8a998] focus:border-[#ff914d] focus:ring-4 focus:ring-[#ff914d]/15",
    error ? "border-red-400 bg-red-50/40" : "border-[#e8ddd3] bg-[#fffaf5]",
    disabled ? "cursor-not-allowed opacity-70" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1410]/40 border-t-[#1a1410]"
    />
  );
}

const translations = {
  en: {
    eyebrow: "Checkout",
    title: "Just a few details.",
    subtitle: "Then we'll take you securely to payment.",
    amount: "Gift card",
    deliveryMethod: "Delivery",
    shipping: "Shipping",
    email: "Email",
    name: "Full name",
    address: "Street address",
    city: "City",
    zip: "Postal code",
    phone: "Phone",
    enterEmail: "your@email.com",
    enterName: "Your full name",
    enterAddress: "Street and house number",
    enterCity: "City",
    enterZip: "Postal code",
    enterPhone: "Phone number",
    total: "Total",
    proceedToPayment: "Continue to payment",
    processing: "Processing…",
    termsNote: "By continuing you agree to our",
    termsLink: "Terms of Service",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email",
    nameRequired: "Full name is required",
    addressRequired: "Address is required for mail delivery",
    cityRequired: "City is required for mail delivery",
    zipRequired: "Postal code is required for mail delivery",
    phoneRequired: "Phone number is required for mail delivery",
    emailDelivery: "Email delivery",
    pickupDelivery: "Pickup at store",
    mailDelivery: "Mail (Iceland)",
  },
  is: {
    eyebrow: "Greiðsla",
    title: "Bara nokkur smáatriði.",
    subtitle: "Svo förum við örugglega yfir í greiðslu.",
    amount: "Gjafakort",
    deliveryMethod: "Afhending",
    shipping: "Sendingargjald",
    email: "Netfang",
    name: "Fullt nafn",
    address: "Heimilisfang",
    city: "Borg",
    zip: "Póstnúmer",
    phone: "Sími",
    enterEmail: "þitt@netfang.is",
    enterName: "Fullt nafn",
    enterAddress: "Gata og húsnúmer",
    enterCity: "Borg",
    enterZip: "Póstnúmer",
    enterPhone: "Símanúmer",
    total: "Samtals",
    proceedToPayment: "Halda áfram í greiðslu",
    processing: "Vinnur…",
    termsNote: "Með því að halda áfram samþykkir þú",
    termsLink: "skilmála okkar",
    emailRequired: "Netfang er nauðsynlegt",
    emailInvalid: "Vinsamlegast settu inn gilt netfang",
    nameRequired: "Fullt nafn er nauðsynlegt",
    addressRequired: "Heimilisfang er nauðsynlegt fyrir póstsendingu",
    cityRequired: "Borg er nauðsynleg fyrir póstsendingu",
    zipRequired: "Póstnúmer er nauðsynlegt fyrir póstsendingu",
    phoneRequired: "Símanúmer er nauðsynlegt fyrir póstsendingu",
    emailDelivery: "Tölvupóstur",
    pickupDelivery: "Sótt í verslun",
    mailDelivery: "Póstur (Ísland)",
  },
};
