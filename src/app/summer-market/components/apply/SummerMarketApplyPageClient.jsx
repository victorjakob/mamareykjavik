"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";

const CATEGORY_OPTIONS = [
  "Art / prints",
  "Jewelry",
  "Ceramics",
  "Clothing / textiles",
  "Wellness products",
  "Ritual items",
  "Herbal / tea / cacao",
  "Skincare / self-care",
  "Home / decor",
  "Food / treats",
  "Other",
];

const MONTH_OPTIONS = ["June", "July", "All"];

const MONTH_DATE_OPTIONS = {
  June: [
    "Fri June 6",
    "Sat June 7",
    "Sun June 8",
    "Fri June 13",
    "Sat June 14",
    "Sun June 15",
    "Fri June 20",
    "Sat June 21",
    "Sun June 22",
    "Fri June 27",
    "Sat June 28",
    "Sun June 29",
  ],
  July: [
    "Fri July 4",
    "Sat July 5",
    "Sun July 6",
    "Fri July 11",
    "Sat July 12",
    "Sun July 13",
    "Fri July 18",
    "Sat July 19",
    "Sun July 20",
    "Fri July 25",
    "Sat July 26",
    "Sun July 27",
  ],
};

// ─── Design tokens ────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#eeecea] rounded-2xl px-5 py-3.5 text-[#1a120c] placeholder:text-[#8a8178] outline-none transition-all duration-200 focus:bg-[#e5e2de] focus:shadow-[0_0_0_3px_rgba(90,68,48,0.12)] resize-none";

// ─── Primitive UI pieces ──────────────────────────────────────────────────────

function Card({ title, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className="overflow-hidden rounded-3xl bg-white p-7 shadow-[0_2px_24px_rgba(30,18,10,0.06)] sm:p-10"
    >
      <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a07c50]">
        {title}
      </p>
      <div className="space-y-6">{children}</div>
    </motion.section>
  );
}

function FieldGroup({
  label,
  required = false,
  error,
  hint,
  children,
  fieldName,
}) {
  return (
    <div
      className={`space-y-2 ${
        error
          ? "rounded-2xl border border-[#d17a70] bg-[#fff4f2] p-3"
          : ""
      }`}
      data-field-name={fieldName}
    >
      {label ? (
        <p className="text-[13px] font-medium text-[#2a1e14]">
          {label}
          {required && <span className="ml-0.5 text-[#a07c50]"> *</span>}
        </p>
      ) : null}
      {children}
      {hint && !error ? (
        <p className="text-[12px] text-[#7a7068]">{hint}</p>
      ) : null}
    </div>
  );
}

/** Pill-style toggle group for radio-like single selection */
function PillGroup({ options, value, onChange, error }) {
  return (
    <div
      className={`space-y-1.5 ${
        error ? "rounded-2xl border border-[#d17a70] bg-[#fff4f2] p-2.5" : ""
      }`}
    >
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
              value === opt
                ? "bg-[#5a4030] text-white shadow-[0_2px_14px_rgba(40,24,12,0.22)]"
                : "bg-[#eeecea] text-[#3a2e26] hover:bg-[#e5e2de]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Chip-style multi-select for checkbox groups */
function ChipGroup({ options, values = [], onChange, error }) {
  const toggle = (opt) => {
    const next = values.includes(opt)
      ? values.filter((v) => v !== opt)
      : [...values, opt];
    onChange(next);
  };

  return (
    <div
      className={`space-y-1.5 ${
        error ? "rounded-2xl border border-[#d17a70] bg-[#fff4f2] p-2.5" : ""
      }`}
    >
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 ${
                selected
                  ? "bg-[#5a4030] text-white shadow-[0_2px_10px_rgba(40,24,12,0.20)]"
                  : "bg-[#eeecea] text-[#3a2e26] hover:bg-[#e5e2de]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Custom styled checkbox / toggle for single boolean fields */
function StyledCheckbox({ checked, onChange, children, error }) {
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flex w-full items-start gap-3.5 rounded-2xl p-2 text-left ${
          error ? "border border-[#d17a70] bg-[#fff4f2]" : ""
        }`}
      >
        <span
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md transition-all duration-200 ${
            checked
              ? "bg-[#5a4030] shadow-[0_2px_8px_rgba(40,24,12,0.22)]"
              : "bg-[#eeecea] ring-1 ring-[#c8c2ba]"
          }`}
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4l3 3 5-6"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="text-[14px] leading-relaxed text-[#2a1e14]">
          {children}
        </span>
      </button>
    </div>
  );
}

// ─── Photo uploader ───────────────────────────────────────────────────────────

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE_MB = 2; // Compress big photos to 2MB; each upload is a separate request (under Vercel 4.5MB)

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: MAX_FILE_SIZE_MB,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
  maxIteration: 10,
};

async function processImageFile(file) {
  const isHEIC =
    file.type?.toLowerCase().includes("heic") ||
    file.type?.toLowerCase().includes("heif");

  let processedFile = file;

  if (isHEIC) {
    const heic2any = (await import("heic2any")).default;
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });
    const convertedBlob = Array.isArray(result) ? result[0] : result;
    processedFile = new File(
      [convertedBlob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      { type: "image/jpeg" }
    );
  }

  const imageCompression = (await import("browser-image-compression")).default;
  return imageCompression(processedFile, IMAGE_COMPRESSION_OPTIONS);
}

function isImageFile(file) {
  return file.type?.startsWith("image/") ?? false;
}

function PhotoUploader({ photos, onChange }) {
  const inputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = async (newFiles) => {
    const imageFiles = Array.from(newFiles).filter(isImageFile);
    if (imageFiles.length === 0) return;

    setIsProcessing(true);
    try {
      const combined = [...photos];
      for (const file of imageFiles) {
        if (combined.length >= MAX_PHOTOS) break;
        try {
          const compressed = await processImageFile(file);
          const formData = new FormData();
          formData.append("photo", compressed);
          const res = await fetch("/api/summer-market/upload-photo", {
            method: "POST",
            body: formData,
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data?.url) {
            combined.push({
              url: data.url,
              preview: data.url,
            });
          }
        } catch (err) {
          console.error("Photo upload error for", file.name, err);
        }
      }
      onChange(combined);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInput = (e) => {
    if (e.target.files?.length) {
      handleFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(Array.from(e.dataTransfer.files));
  };

  const remove = (index) => onChange(photos.filter((_, i) => i !== index));

  const canAdd = photos.length < MAX_PHOTOS && !isProcessing;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {photos.map((p, i) => (
            <motion.div
              key={`${i}-${p.preview}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-24 w-24 overflow-hidden rounded-2xl"
            >
              <Image
                src={p.preview}
                alt={`Photo ${i + 1}`}
                fill
                unoptimized
                sizes="96px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
                aria-label="Remove photo"
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            disabled={isProcessing}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#eeecea] text-[#5a4030] transition-all hover:bg-[#e5e2de] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] font-medium">
              {isProcessing ? "Uploading…" : "Add photo"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
        onChange={handleInput}
      />

      <p className="text-[12px] text-[#7a7068]">
        {photos.length === 0
          ? "Share a few images so we can see your work — optional."
          : `${photos.length} of ${MAX_PHOTOS} photos added.`}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SummerMarketApplyPageClient() {
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  useEffect(() => {
    if (isSubmitted) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isSubmitted]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      productCategory: [],
      preferredDates: [],
      month: "June",
      needsPower: "No",
      tableclothRental: "No",
      instagramShare: false,
      applicationConfirmation: false,
    },
  });

  const selectedMonth = watch("month");
  const productCategory = watch("productCategory") || [];
  const preferredDates = watch("preferredDates") || [];
  const needsPower = watch("needsPower");
  const tableclothRental = watch("tableclothRental");
  const instagramShare = watch("instagramShare");
  const applicationConfirmation = watch("applicationConfirmation");

  const dateOptions = useMemo(() => {
    if (selectedMonth === "All") {
      return [...MONTH_DATE_OPTIONS.June, ...MONTH_DATE_OPTIONS.July];
    }
    return MONTH_DATE_OPTIONS[selectedMonth] || [];
  }, [selectedMonth]);

  const weekendGroups = useMemo(() => {
    const groups = [];
    for (let i = 0; i < dateOptions.length; i += 3) {
      groups.push(dateOptions.slice(i, i + 3));
    }
    return groups.filter((g) => g.length > 0);
  }, [dateOptions]);

  useEffect(() => {
    setValue("preferredDates", []);
  }, [selectedMonth, setValue]);

  const toggleDate = (date) => {
    const next = preferredDates.includes(date)
      ? preferredDates.filter((d) => d !== date)
      : [...preferredDates, date];
    setValue("preferredDates", next, { shouldValidate: true });
  };

  const errorFallbackMessage = {
    brandName: "Brand / business name is required.",
    contactPerson: "Contact person is required.",
    email: "Please enter a valid email address.",
    phoneWhatsapp: "Phone / WhatsApp is required.",
    whatDoYouSell: "Please tell us what you sell.",
    productCategory: "Please select at least one category.",
    month: "Please select a month.",
    preferredDates: "Please select at least one date.",
    needsPower: "Please choose whether you need power.",
    tableclothRental: "Please choose whether you need tablecloth rental.",
    applicationConfirmation: "You must confirm that this is an application.",
  };

  const focusableFields = new Set([
    "brandName",
    "contactPerson",
    "email",
    "phoneWhatsapp",
    "whatDoYouSell",
    "instagramOrWebsite",
    "setupNotes",
    "anythingElse",
  ]);

  const onInvalid = (formErrors) => {
    const firstErrorField = Object.keys(formErrors)[0];
    if (!firstErrorField) return;

    const target =
      document.querySelector(`[data-field-name="${firstErrorField}"]`) ||
      document.querySelector(`[name="${firstErrorField}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const message =
      formErrors[firstErrorField]?.message ||
      errorFallbackMessage[firstErrorField] ||
      "Please complete the required fields.";
    toast.error(message);

    if (focusableFields.has(firstErrorField)) {
      setFocus(firstErrorField);
    }
  };

  const onSubmit = async (values) => {
    try {
      setSubmitError("");

      const body = {
        brandName: values.brandName,
        contactPerson: values.contactPerson,
        email: values.email,
        phoneWhatsapp: values.phoneWhatsapp,
        whatDoYouSell: values.whatDoYouSell,
        productCategory: values.productCategory || [],
        instagramOrWebsite: values.instagramOrWebsite || "",
        month: values.month,
        preferredDates: values.preferredDates || [],
        needsPower: values.needsPower,
        tableclothRental: values.tableclothRental,
        setupNotes: values.setupNotes || "",
        instagramShare: values.instagramShare ?? false,
        anythingElse: values.anythingElse || "",
        applicationConfirmation: values.applicationConfirmation ?? false,
        photoUrls: uploadedPhotos.map((p) => p.url).filter(Boolean),
      };

      const response = await fetch("/api/summer-market/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to submit application.");
      }

      setIsSubmitted(true);
    } catch (error) {
      const message = error.message || "Something went wrong.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  if (isSubmitted) {
    return (
      <main className="relative min-h-screen overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="absolute inset-0 -z-10 bg-[#f4f2ef]" />
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl bg-white p-10 text-center shadow-[0_4px_28px_rgba(30,18,10,0.07)]"
          >
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a07c50]">
              White Lotus · Reykjavík
            </p>
            <h1 className="text-3xl text-[#1a120c] sm:text-4xl">
              Thank you for applying.
            </h1>
            <p className="mt-4 text-base leading-8 text-[#5a5048]">
              We've received your application and will be in touch soon.
            </p>
            <div className="mt-8 border-t border-[#ede9e3] pt-6">
              <Link
                href="/summer-market"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#a07c50] transition hover:text-[#7a5c34]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Summer Market
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32">
      <div className="absolute inset-0 -z-10 bg-[#f4f2ef]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_at_top,rgba(160,124,80,0.10),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a07c50]">
            Vendor Application
          </p>
          <h1 className="text-4xl leading-tight text-[#1a120c] sm:text-5xl">
            Apply for White Lotus Summer Market
          </h1>
          <p className="mt-5 text-base leading-8 text-[#5a5048]">
            Thank you for your interest in joining the White Lotus Summer Market.
            Please fill in the form below and we'll be in touch after review.
          </p>
        </motion.header>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit(onSubmit, onInvalid)}>

          {/* ── Basic Details ── */}
          <Card title="Basic Details" delay={0.05}>
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldGroup
                label="Brand / business name"
                required
                error={errors.brandName?.message}
                fieldName="brandName"
              >
                <input
                  className={inputCls}
                  placeholder="Your brand or business name"
                  {...register("brandName", { required: "Brand / business name is required." })}
                />
              </FieldGroup>

              <FieldGroup
                label="Contact person"
                required
                error={errors.contactPerson?.message}
                fieldName="contactPerson"
              >
                <input
                  className={inputCls}
                  placeholder="Your full name"
                  {...register("contactPerson", { required: "Contact person is required." })}
                />
              </FieldGroup>

              <FieldGroup
                label="Email"
                required
                error={errors.email?.message}
                fieldName="email"
              >
                <input
                  type="email"
                  className={inputCls}
                  placeholder="hello@example.com"
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Please enter a valid email address.",
                    },
                  })}
                />
              </FieldGroup>

              <FieldGroup
                label="Phone / WhatsApp"
                required
                error={errors.phoneWhatsapp?.message}
                fieldName="phoneWhatsapp"
              >
                <input
                  className={inputCls}
                  placeholder="+354 000 0000"
                  {...register("phoneWhatsapp", { required: "Phone / WhatsApp is required." })}
                />
              </FieldGroup>
            </div>
          </Card>

          {/* ── About your products ── */}
          <Card title="About your products" delay={0.08}>
            <FieldGroup
              label="What do you sell?"
              required
              hint="Tell us a little about your products."
              error={errors.whatDoYouSell?.message}
              fieldName="whatDoYouSell"
            >
              <textarea
                rows={4}
                className={inputCls}
                placeholder="Describe what you make or sell…"
                {...register("whatDoYouSell", { required: "Please tell us what you sell." })}
              />
            </FieldGroup>

            <FieldGroup
              label="Product category"
              required
              error={errors.productCategory?.message}
              fieldName="productCategory"
            >
              <ChipGroup
                options={CATEGORY_OPTIONS}
                values={productCategory}
                onChange={(next) =>
                  setValue("productCategory", next, { shouldValidate: true })
                }
                error={
                  errors.productCategory
                    ? "Please select at least one category."
                    : null
                }
              />
              <input
                type="hidden"
                {...register("productCategory", {
                  validate: (v) => v?.length > 0 || "Please select at least one category.",
                })}
              />
            </FieldGroup>

            <FieldGroup
              label="Instagram or website"
              error={errors.instagramOrWebsite?.message}
              fieldName="instagramOrWebsite"
            >
              <input
                className={inputCls}
                placeholder="@yourhandle or https://yoursite.com"
                {...register("instagramOrWebsite")}
              />
            </FieldGroup>
          </Card>

          {/* ── Dates ── */}
          <Card title="Dates" delay={0.1}>
            <FieldGroup
              label="Which month are you interested in?"
              required
              fieldName="month"
            >
              <PillGroup
                options={MONTH_OPTIONS}
                value={selectedMonth}
                onChange={(v) => setValue("month", v, { shouldValidate: true })}
              />
              <input
                type="hidden"
                {...register("month", { required: "Please select a month." })}
              />
            </FieldGroup>

            <FieldGroup
              label="Select the dates you'd like"
              required
              error={errors.preferredDates ? "Please select at least one date." : null}
              fieldName="preferredDates"
            >
              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {weekendGroups.map((group, gi) => {
                  const anySelected = group.some((d) => preferredDates.includes(d));
                  return (
                    <div
                      key={`${group[0]}-${gi}`}
                      className={`rounded-2xl p-3 transition-all duration-200 ${
                        anySelected
                          ? "bg-[#5a4030]/[0.07] ring-1 ring-[#5a4030]/25"
                          : "bg-[#eeecea]"
                      }`}
                    >
                      <div className="space-y-2">
                        {group.map((date) => {
                          const sel = preferredDates.includes(date);
                          return (
                            <button
                              key={date}
                              type="button"
                              onClick={() => toggleDate(date)}
                              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[13px] leading-snug transition-all duration-150 ${
                                sel
                                  ? "bg-[#5a4030] text-white"
                                  : "text-[#2a1e14] hover:bg-white/70"
                              }`}
                            >
                              <span
                                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md transition-all ${
                                  sel ? "bg-white/25" : "bg-[#d8d4ce]"
                                }`}
                              >
                                {sel && (
                                  <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </span>
                              {date}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <input
                type="hidden"
                {...register("preferredDates", {
                  validate: (v) => v?.length > 0 || "Please select at least one date.",
                })}
              />
            </FieldGroup>
          </Card>

          {/* ── Setup ── */}
          <Card title="Setup" delay={0.12}>
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldGroup
                label="Do you need power at your booth?"
                required
                error={errors.needsPower?.message}
                fieldName="needsPower"
              >
                <PillGroup
                  options={["Yes", "No"]}
                  value={needsPower}
                  onChange={(v) => setValue("needsPower", v, { shouldValidate: true })}
                />
                <input
                  type="hidden"
                  {...register("needsPower", {
                    required: "Please choose whether you need power.",
                  })}
                />
              </FieldGroup>

              <FieldGroup
                label="Would you like tablecloth rental?"
                required
                error={errors.tableclothRental?.message}
                fieldName="tableclothRental"
              >
                <PillGroup
                  options={["Yes", "No"]}
                  value={tableclothRental}
                  onChange={(v) => setValue("tableclothRental", v, { shouldValidate: true })}
                />
                <input
                  type="hidden"
                  {...register("tableclothRental", {
                    required: "Please choose whether you need tablecloth rental.",
                  })}
                />
              </FieldGroup>
            </div>

            <FieldGroup
              label="Anything we should know about your setup?"
              error={errors.setupNotes?.message}
              fieldName="setupNotes"
            >
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Special requirements, dimensions, etc…"
                {...register("setupNotes")}
              />
            </FieldGroup>
          </Card>

          {/* ── Photos ── */}
          <Card title="Photos" delay={0.14}>
            <FieldGroup label="Upload up to 3 product / brand photos" fieldName="photos">
              <PhotoUploader photos={uploadedPhotos} onChange={setUploadedPhotos} />
            </FieldGroup>
          </Card>

          {/* ── Community ── */}
          <Card title="Community" delay={0.16}>
            <StyledCheckbox
              checked={instagramShare}
              onChange={(v) => setValue("instagramShare", v)}
            >
              I'm happy to share about the market on Instagram and tag
              @mamareykjavik and @whitelotusvenue
            </StyledCheckbox>
          </Card>

          {/* ── Final ── */}
          <Card title="Final" delay={0.18}>
            <FieldGroup
              label="Anything else you'd like to share?"
              error={errors.anythingElse?.message}
              fieldName="anythingElse"
            >
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Anything else on your mind…"
                {...register("anythingElse")}
              />
            </FieldGroup>

            <StyledCheckbox
              checked={applicationConfirmation}
              onChange={(v) => setValue("applicationConfirmation", v, { shouldValidate: true })}
              error={
                errors.applicationConfirmation
                  ? "You must confirm that this is an application."
                  : null
              }
            >
              I understand this is an application and not a confirmed booking.
            </StyledCheckbox>
            <input
              type="hidden"
              {...register("applicationConfirmation", {
                validate: (v) => v || "You must confirm that this is an application.",
              })}
            />
          </Card>

          {submitError ? (
            <p className="rounded-2xl bg-[#fdf0ee] px-5 py-3.5 text-sm text-[#8a2e24]">
              {submitError}
            </p>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center pb-4"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#5a4030] px-8 py-3 text-sm font-medium tracking-wide text-white shadow-[0_4px_18px_rgba(30,18,10,0.22)] transition-all hover:bg-[#4a3025] hover:shadow-[0_4px_22px_rgba(30,18,10,0.30)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Apply to the Market"}
            </button>
          </motion.div>
        </form>
      </div>
    </main>
  );
}
