"use client";

import { useEditEventForm } from "./hooks/useEditEventForm";
import {
  FormHeader,
  FormSection,
  FormField,
  ImageUpload,
  PaymentMethodSelector,
  TicketVariants,
  EarlyBirdPricing,
  SlidingScalePricing,
  HostSelector,
  SubmitButton,
} from "./components";
import { PropagateLoader } from "react-spinners";

export default function EditEvent() {
  const {
    register,
    handleSubmit,
    errors,
    setError,
    watch,
    isSubmitting,
    imageProcessing,
    imagePreview,
    handleImageChange,
    ticketVariants,
    addTicketVariant,
    removeTicketVariant,
    updateTicketVariant,
    showEarlyBird,
    setShowEarlyBird,
    showSlidingScale,
    setShowSlidingScale,
    event,
    onSubmit,
  } = useEditEventForm();

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <FormHeader />

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
              imageProcessing={imageProcessing}
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
                label="Duration (hours)"
                name="duration"
                register={register}
                error={errors.duration}
                type="number"
                min="0"
                step="0.5"
                placeholder="2.5"
                focusColor="emerald"
              />
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

              <TicketVariants
                ticketVariants={ticketVariants}
                addTicketVariant={addTicketVariant}
                removeTicketVariant={removeTicketVariant}
                updateTicketVariant={updateTicketVariant}
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
              isAdmin={false}
              hostUsers={[]}
            />
          </FormSection>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p
                className="text-sm text-red-600 text-center flex items-center justify-center gap-2"
                role="alert"
              >
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
                {errors.root.message}
              </p>
            </div>
          )}

          <SubmitButton
            isSubmitting={isSubmitting}
            imageProcessing={imageProcessing}
          />
        </form>
      </div>
    </div>
  );
}
