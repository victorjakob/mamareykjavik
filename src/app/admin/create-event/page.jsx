"use client";

import { useEventForm } from "./hooks/useEventForm";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import AdminGuard from "../AdminGuard";
import { useEffect } from "react";
import Link from "next/link";
import {
  AdminShell,
  AdminHeader,
} from "@/app/admin/components/AdminShell";
import {
  FormSection,
  FormField,
  ImageUpload,
  PaymentMethodSelector,
  PriceVariants,
  EarlyBirdPricing,
  SlidingScalePricing,
  HostSelector,
  SubmitButton,
} from "./components";

export default function CreateEvent() {
  const {
    register,
    handleSubmit,
    errors,
    setError,
    watch,
    setValue,
    isSubmitting,
    imageProcessing,
    imagePreview,
    handleImageChange,
    ticketVariants,
    addTicketVariant,
    removeTicketVariant,
    updateTicketVariant,
    showVariants,
    setShowVariants,
    showEarlyBird,
    setShowEarlyBird,
    showSlidingScale,
    setShowSlidingScale,
    showCustomLocation,
    setShowCustomLocation,
    additionalDates,
    additionalDateErrors,
    addAdditionalDate,
    updateAdditionalDate,
    removeAdditionalDate,
    hostUsers,
    isAdmin,
    session,
    status,
    onSubmit,
  } = useEventForm();

  const hostingPolicyAgreed = watch("hosting_wl_policy_agreed");

  // Ensure location field always has a value
  useEffect(() => {
    if (!showCustomLocation) {
      setValue("location", "Bankastræti 2, 101 Reykjavik");
    }
  }, [showCustomLocation, setValue]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to create events...</p>
      </div>
    );
  }

  return (
    <AdminGuard>
      <AdminShell maxWidth="max-w-4xl">
        <AdminHeader
          eyebrow="Admin · White Lotus"
          title="Create Event"
          subtitle="Design a new White Lotus experience"
        />

        {/* Auto-save indicator */}
        <div className="mb-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(255,145,77,0.08)",
              border: "1px solid rgba(255,145,77,0.2)",
            }}
          >
            <svg
              className="w-4 h-4 text-[#ff914d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium text-[#9a7a62]">
              Auto-saving your progress…
            </span>
          </div>
        </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 sm:space-y-8"
          >
            {/* 🎨 Visual Identity Section */}
            <FormSection
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff914d]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              title="Image"
              description="Aspect ratio 16:9"
              gradientFrom="pink-500"
              gradientTo="rose-500"
            >
              <ImageUpload
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onError={setError}
              />
            </FormSection>

            {/* 📝 Content Section */}
            <FormSection
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff914d]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
              title="Event Description"
              description="Tell the story to your audience"
              gradientFrom="blue-500"
              gradientTo="cyan-500"
            >
              <FormField
                label="Event Name"
                name="name"
                register={register}
                error={errors.name}
                placeholder="Enter your event name..."
              />
              <FormField
                label="Front Page Description"
                name="shortdescription"
                register={register}
                error={errors.shortdescription}
                placeholder="A short, captivating description..."
              />
              <FormField
                label="Full Description"
                name="description"
                register={register}
                error={errors.description}
                type="textarea"
                placeholder="Share the complete story of your event..."
              />
              <FormField
                label="Facebook Event Link (Optional)"
                name="facebook_link"
                register={register}
                error={errors.facebook_link}
                type="url"
                placeholder="https://www.facebook.com/events/..."
                focusColor="blue"
              />
            </FormSection>

            {/* ⏰ Timing Section */}
            <FormSection
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff914d]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Event Timing"
              description=""
              gradientFrom="emerald-500"
              gradientTo="teal-500"
            >
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <FormField
                  label="Date and Time"
                  name="date"
                  register={register}
                  error={errors.date}
                  type="datetime-local"
                  focusColor="emerald"
                />
                {additionalDates.map((dateValue, index) => (
                  <div key={`additional-date-${index}`} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`additional-date-${index}`}
                        className="block text-xs font-medium tracking-wide text-[#9a7a62]"
                      >
                        Date and Time {index + 2}
                      </label>
                      <button
                        type="button"
                        onClick={() => removeAdditionalDate(index)}
                        className="text-xs font-medium text-[#c05a1a] hover:text-[#ff8080] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      id={`additional-date-${index}`}
                      type="datetime-local"
                      value={dateValue}
                      onChange={(event) =>
                        updateAdditionalDate(index, event.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30 transition-all duration-200"
                      style={{
                        backgroundColor: "#faf6f2",
                        color: "#2c1810",
                        border: additionalDateErrors[index]
                          ? "1px solid rgba(255,107,107,0.4)"
                          : "1px solid #e8ddd3",
                      }}
                    />
                    {additionalDateErrors[index] && (
                      <p className="text-xs text-[#c05a1a]">
                        {additionalDateErrors[index]}
                      </p>
                    )}
                  </div>
                ))}
                <div>
                  <button
                    type="button"
                    onClick={() => addAdditionalDate(watch("date"))}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
                    style={{
                      background: "rgba(255,145,77,0.1)",
                      color: "#ff914d",
                      border: "1px solid rgba(255,145,77,0.25)",
                    }}
                  >
                    + Add another date
                  </button>
                </div>
                <FormField
                  label="Duration (hours) - Optional"
                  name="duration"
                  register={register}
                  error={errors.duration}
                  type="number"
                  min="0"
                  step="0.25"
                  placeholder="Leave empty if no specific duration"
                  focusColor="emerald"
                />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium tracking-wide text-[#9a7a62]">
                      Event Location
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomLocation(!showCustomLocation)}
                      className="text-xs font-medium text-[#ff914d] hover:text-[#c76a2b] transition-colors"
                    >
                      {showCustomLocation ? "Use default" : "Change location"}
                    </button>
                  </div>

                  {!showCustomLocation ? (
                    <div
                      className="px-4 py-3 rounded-xl text-sm"
                      style={{
                        background: "rgba(255,145,77,0.06)",
                        border: "1px solid rgba(255,145,77,0.2)",
                        color: "#2c1810",
                      }}
                    >
                      White Lotus, Bankastræti 2, 101 Reykjavik
                    </div>
                  ) : (
                    <FormField
                      name="location"
                      register={register}
                      error={errors.location}
                      placeholder="Enter custom location..."
                    />
                  )}
                </div>
              </div>
            </FormSection>

            {/* 💰 Pricing Section */}
            <FormSection
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff914d]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              }
              title="Pricing & Payment"
              description=""
              gradientFrom="amber-500"
              gradientTo="orange-500"
            >
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <FormField
                    label="Price (ISK)"
                    name="price"
                    register={register}
                    error={errors.price}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="5000"
                    focusColor="amber"
                  />
                  <PaymentMethodSelector
                    register={register}
                    error={errors.payment}
                  />
                </div>

                <PriceVariants
                  ticketVariants={ticketVariants}
                  addTicketVariant={addTicketVariant}
                  removeTicketVariant={removeTicketVariant}
                  updateTicketVariant={updateTicketVariant}
                  showVariants={showVariants}
                  setShowVariants={setShowVariants}
                />

                <EarlyBirdPricing
                  register={register}
                  showEarlyBird={showEarlyBird}
                  setShowEarlyBird={setShowEarlyBird}
                />

                <SlidingScalePricing
                  register={register}
                  showSlidingScale={showSlidingScale}
                  setShowSlidingScale={setShowSlidingScale}
                  watch={watch}
                  errors={errors}
                />
                <FormField
                  label="Event Capacity (Optional)"
                  name="capacity"
                  register={register}
                  error={errors.capacity}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Leave empty for unlimited capacity"
                  focusColor="amber"
                  helpText="Maximum number of tickets that can be sold. Leave empty or set to 0 for unlimited capacity."
                />
              </div>
            </FormSection>

            {/* 👤 Management Section */}
            <FormSection
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff914d]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              title="Event management"
              description="Who should be able to edit this event and receive signup notifications?"
              gradientFrom="purple-500"
              gradientTo="pink-500"
            >
              <HostSelector
                register={register}
                error={errors.host || errors.host_secondary}
                isAdmin={isAdmin}
                hostUsers={hostUsers}
              />
            </FormSection>

            <FormSection
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff914d]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Host agreement"
              description="Required to create an event in White Lotus"
              gradientFrom="emerald-500"
              gradientTo="lime-500"
            >
              <div
                className="rounded-xl p-4"
                style={{
                  background: "#faf6f2",
                  border: "1px solid #e8ddd3",
                }}
              >
                <label className="flex items-start gap-3">
                  <input
                    id="hosting_wl_policy_agreed"
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded accent-[#ff914d]"
                    style={{ borderColor: "#e8ddd3" }}
                    {...register("hosting_wl_policy_agreed")}
                  />
                  <span className="text-sm leading-relaxed text-[#2c1810]">
                    I agree to the terms of hosting in our White Lotus.{" "}
                    <Link
                      href="/policies/hosting-wl"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#ff914d] underline underline-offset-2 hover:text-[#c76a2b] transition-colors"
                    >
                      Read the Event Host Policy
                    </Link>
                    .
                  </span>
                </label>

                {errors.hosting_wl_policy_agreed && (
                  <p className="mt-2 text-sm text-[#c05a1a] flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.hosting_wl_policy_agreed.message}
                  </p>
                )}
              </div>
            </FormSection>

            <SubmitButton
              isSubmitting={isSubmitting}
              imageProcessing={imageProcessing}
              isDisabled={!hostingPolicyAgreed}
            />
          </form>
      </AdminShell>
    </AdminGuard>
  );
}
