"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Input = ({
  label,
  name,
  type = "text",
  register,
  required,
  placeholder,
  className = "",
}) => {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        {...register(name, { required })}
        placeholder={placeholder}
        className={`rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ff914d] hover:border-[#ff914d] transition-all duration-200 ${className}`}
      />
    </div>
  );
};

const Textarea = ({ label, name, register, placeholder, rows = 4 }) => {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        {...register(name)}
        rows={rows}
        placeholder={placeholder}
        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ff914d] hover:border-[#ff914d] transition-all duration-200"
      />
    </div>
  );
};

export default function FormWL() {
  const [startDate, setStartDate] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", { ...data, timeAndDate: startDate });
    reset();
    setStartDate(null);
    // Here we'll add email integration in the next step
  };

  return (
    <div className="pt-16 md:pt-28 py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-right md:text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 w-[50%] ml-auto md:w-full md:ml-0">
            Rent White Lotus Venue
          </h1>
          <p className="max-w-[90%] text-base md:text-lg text-gray-600 mx-auto px-2">
            Transform your event into an unforgettable experience at White
            Lotus. Fill out the form below and let us help bring your vision to
            life.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-4 sm:p-8 md:p-10">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 md:space-y-6"
            >
              <div className="grid grid-cols-1 gap-y-4 md:gap-y-6 md:gap-x-4 md:grid-cols-2">
                <Input
                  label="Name"
                  name="name"
                  register={register}
                  required
                  placeholder="Your full name"
                  className="transition-all duration-200"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  register={register}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <Input
                label="Event Type"
                name="event"
                register={register}
                required
                placeholder="e.g. Dance, Concert, Private Event, Birthday Party"
              />

              <div className="grid grid-cols-1 gap-y-4 md:gap-y-6 md:gap-x-4 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    placeholderText="Select date and time"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ff914d] hover:border-[#ff914d] transition-all duration-200"
                    required
                  />
                </div>
                <Input
                  label="Expected Guest Count"
                  name="guestCount"
                  type="text"
                  register={register}
                  required
                  placeholder="Number of guests"
                />
              </div>

              <Textarea
                label="Additional Details"
                name="comments"
                register={register}
                placeholder="Tell us more about your event, special requirements, or any questions you have..."
                rows={4}
              />

              <div className="pt-2 md:pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg md:rounded-xl shadow-sm text-base md:text-lg font-medium text-white bg-[#ff914d] hover:bg-[#ff8033] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-all duration-200"
                >
                  Submit Inquiry
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        <div className="mt-6 md:mt-8 text-center text-gray-600">
          <p className="text-xs md:text-sm">
            Need immediate assistance? Call us at{" "}
            <a
              href="tel:+3546167855"
              className="text-[#ff914d] hover:text-[#ff8033]"
            >
              (+354) 616-7855
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
