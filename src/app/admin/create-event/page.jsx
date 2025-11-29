"use client";

import { useEventForm } from "./hooks/useEventForm";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import AdminGuard from "../AdminGuard";
import { useEffect } from "react";
import {
  FormHeader,
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
    hostUsers,
    isAdmin,
    session,
    status,
    onSubmit,
  } = useEventForm();

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
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
          <FormHeader />

          {/* Auto-save indicator */}
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <svg
                className="w-4 h-4 text-green-600"
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
              <span className="text-sm text-green-700 font-medium">
                Auto-saving your progress...
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
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                    <label className="block text-sm font-medium text-gray-700">
                      Event Location
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomLocation(!showCustomLocation)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {showCustomLocation ? "Use default" : "Change location"}
                    </button>
                  </div>

                  {!showCustomLocation ? (
                    <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                      White Lotus, Bankastræti 2, 101 Reykjavik
                    </div>
                  ) : (
                    <FormField
                      name="location"
                      register={register}
                      error={errors.location}
                      placeholder="Enter custom location..."
                      focusColor="emerald"
                    />
                  )}
                </div>
              </div>
            </FormSection>

            {/* 💰 Pricing Section */}
            <FormSection
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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

            {/* 👤 Host Section */}
            <FormSection
              icon={
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
              title="Event Host"
              description="Who will be leading this experience?"
              gradientFrom="purple-500"
              gradientTo="pink-500"
            >
              <HostSelector
                register={register}
                error={errors.host}
                isAdmin={isAdmin}
                hostUsers={hostUsers}
              />
            </FormSection>

            <SubmitButton
              isSubmitting={isSubmitting}
              imageProcessing={imageProcessing}
            />
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
