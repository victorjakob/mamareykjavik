"use client";

import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/sendgrid/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setSubmitStatus({
        type: "success",
        message: "Thank you! Your message has been sent successfully. :)",
      });
      reset();
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitStatus({
        type: "error",
        message:
          "Sorry, there was an error sending your message. Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 ">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8  p-8 rounded-2xl "
      >
        <div>
          <label
            htmlFor="name"
            className="block text-base font-normal pl-3 text-gray-700 mb-2"
          >
            Name
          </label>
          <input
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            type="text"
            id="name"
            className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#455318]/20 focus:border-[#455318] outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
              errors.name ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="Your name"
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-500"
            >
              {errors.name.message}
            </motion.p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-base font-normal pl-3 text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            type="email"
            id="email"
            className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#455318]/20 focus:border-[#455318] outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-500"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-base font-normal pl-3 text-gray-700 mb-2"
          >
            Message
          </label>
          <textarea
            {...register("message", {
              required: "Message is required",
              minLength: {
                value: 10,
                message: "Message must be at least 10 characters",
              },
            })}
            id="message"
            rows={6}
            className={`w-full px-5 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#455318]/20 focus:border-[#455318] outline-none transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm ${
              errors.message ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="Your message..."
          />
          {errors.message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-500"
            >
              {errors.message.message}
            </motion.p>
          )}
        </div>

        {submitStatus.message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl ${
              submitStatus.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {submitStatus.message}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "#698d42" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-[#455318] text-white py-4 px-8 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-[#698d42] ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </motion.button>
      </motion.form>
    </div>
  );
}
