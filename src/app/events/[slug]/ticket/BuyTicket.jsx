"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { supabase } from "@/util/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import GoogleSignin from "@/app/auth/GoogleSignin";

/**
 * BuyTicket component handles ticket purchasing flow including user authentication and payment processing
 * @param {Object} event - Event details including id, name, date, duration, price, early_bird_price
 */
export default function BuyTicket({ event }) {
  const router = useRouter();
  const { data: session } = useSession();

  // Ticket state
  const [ticketCount, setTicketCount] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Auth form state
  const [showRegister, setShowRegister] = useState(true);
  const [wantAccount, setWantAccount] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Check if early bird price is still valid
  const isEarlyBirdValid = () => {
    if (!event.early_bird_price || !event.early_bird_date) return false;
    const now = new Date();
    const earlyBirdDeadline = new Date(event.early_bird_date);
    return now < earlyBirdDeadline;
  };

  // Get the current price based on early bird availability
  const currentPrice = isEarlyBirdValid()
    ? event.early_bird_price
    : event.price;

  // Ticket count handlers
  const decrementTickets = () => {
    if (ticketCount > 1) {
      setTicketCount((prev) => prev - 1);
    }
  };

  const incrementTickets = () => {
    if (ticketCount < 8) {
      setTicketCount((prev) => prev + 1);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    setError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!session) {
      if (!formData.email || !formData.email.includes("@")) {
        setError("Please enter a valid email address");
        return false;
      }
      if (!formData.name) {
        setError("Please enter your name");
        return false;
      }
      if (wantAccount) {
        if (!formData.password || formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          return false;
        }
        if (!acceptTerms) {
          setError("You must accept the terms of service");
          return false;
        }
      }
    }
    return true;
  };

  /**
   * Handles account creation
   */
  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    try {
      setIsCreatingAccount(true);
      setError(null);

      // Register user using the signup API endpoint
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      if (!res.ok) {
        const responseData = await res.json();
        throw new Error(responseData.error || "Registration failed");
      }

      // Automatically sign in after successful registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      setSuccessMessage(
        "Account created successfully! You can now proceed to payment."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  /**
   * Handles user login
   */
  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoggingIn(true);
      setError(null);

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  /**
   * Handles the password reset request
   */
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsResettingPassword(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reset email");
      }

      setSuccessMessage("Password reset instructions sent to your email");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResettingPassword(false);
    }
  };

  /**
   * Handles the payment flow
   */
  const handlePayment = async () => {
    if (!validateForm()) return;

    try {
      setIsProcessingPayment(true);
      setError(null);

      const buyerEmail = session ? session.user.email : formData.email;
      const buyerName = session ? session.user.name : formData.name;

      if (event.payment === "door" || event.payment === "free") {
        // Create ticket record for door/free payment
        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .insert([
            {
              event_id: event.id,
              buyer_email: buyerEmail,
              buyer_name: buyerName,
              quantity: ticketCount,
              status: event.payment,
              price: currentPrice,
              total_price: currentPrice * ticketCount,
            },
          ])
          .select("*, events(*)")
          .single();

        if (ticketError) throw ticketError;

        // Send confirmation email
        const response = await fetch("/api/sendgrid/ticket", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticketInfo: {
              events: {
                name: event.name,
                date: event.date,
                price: currentPrice,
                duration: event.duration,
                host: event.host,
              },
            },
            userEmail: buyerEmail,
            userName: buyerName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.details || "Failed to send confirmation email"
          );
        }

        // Redirect based on user authentication status
        if (session) {
          router.push("/profile/my-tickets");
        } else {
          router.push(`/events/ticket-confirmation`);
        }
      } else {
        // Process payment through SaltPay for paid tickets
        const unitPrice = parseInt(currentPrice);
        const totalPrice = unitPrice * ticketCount;

        const response = await fetch("/api/saltpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice,
            eventId: event.id,
            buyer_email: buyerEmail,
            buyer_name: buyerName,
            quantity: ticketCount,
            items: [
              {
                description: `${event.name}`,
                count: ticketCount,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Payment processing failed");
        }

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Payment/Ticket creation error:", err);
    }
  };

  const getButtonText = () => {
    if (isProcessingPayment) {
      return (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </div>
      );
    }

    if (event.payment === "free") {
      return "Get my free ticket";
    }
    if (event.payment === "door") {
      return "Get ticket, Pay at the door";
    }
    return "Proceed to Payment";
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Event Details Section */}
      <div className="bg-gradient-to-r from-[#FFF1E6] to-[#f8dcc6]  p-8">
        <h2 className="text-3xl font-bold mb-4">{event.name}</h2>
        <div className="space-y-3 opacity-90">
          <div className="flex items-center gap-2">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>{format(new Date(event.date), "MMMM d, yyyy")}</p>
          </div>
          <div className="flex items-center gap-2">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>
              {format(new Date(event.date), "h:mm a")} ({event.duration} hours)
            </p>
          </div>
          <div className="flex items-center gap-2">
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p>White Lotus venue, Bankastræti 2, 101 Reykjavik</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Ticket Counter */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Number of Tickets
          </label>
          <div className="flex items-center justify-between max-w-[200px] mx-auto bg-gray-50 rounded-lg p-2">
            <button
              onClick={decrementTickets}
              className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl font-medium text-gray-600">-</span>
            </button>
            <AnimatePresence mode="wait">
              <motion.span
                key={ticketCount}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-semibold text-gray-800"
              >
                {ticketCount}
              </motion.span>
            </AnimatePresence>
            <button
              onClick={incrementTickets}
              className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl font-medium text-gray-600">+</span>
            </button>
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Price per ticket:</span>
            <p className="text-2xl font-bold text-gray-900">
              {currentPrice} ISK
            </p>
            {isEarlyBirdValid() && (
              <>
                <p className="text-sm text-green-600 font-normal">
                  Early Bird Price!
                </p>
                <p className="text-sm text-gray-500 line-through">
                  Regular price: {event.price} ISK
                </p>
                <p className="text-xs text-gray-500">
                  Until{" "}
                  {format(new Date(event.early_bird_date), "MMMM d, h:mm a")}
                </p>
              </>
            )}
            <div className="mt-2 text-xl text-gray-600">
              Total:{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPrice * ticketCount}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-semibold text-gray-900"
                >
                  {currentPrice * ticketCount} ISK
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* User Section */}
        {session ? (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {session.user.name}
                  </p>
                  <p className="text-sm text-gray-600">{session.user.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200"
            >
              {getButtonText()}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {showForgotPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                <button
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200"
                >
                  {isResettingPassword ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending Reset Link...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-orange-600 hover:text-orange-800 font-medium"
                  >
                    Back to login
                  </button>
                </p>
              </div>
            ) : showRegister ? (
              <>
                <div className="space-y-4">
                  <GoogleSignin callbackUrl={`/events/${event.slug}/ticket`} />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        or continue with email
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg">
                      <input
                        type="checkbox"
                        id="createAccount"
                        checked={wantAccount}
                        onChange={(e) => setWantAccount(e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label
                        htmlFor="createAccount"
                        className="text-sm text-gray-700"
                      >
                        Create an account for faster checkout
                      </label>
                    </div>
                  </div>

                  <AnimatePresence>
                    {wantAccount && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password
                            </label>
                            <input
                              type="password"
                              name="password"
                              placeholder="Create a secure password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                              required
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="newsletter"
                              checked={subscribeToNewsletter}
                              onChange={(e) =>
                                setSubscribeToNewsletter(e.target.checked)
                              }
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <label
                              htmlFor="newsletter"
                              className="text-sm text-gray-700"
                            >
                              Keep me updated about upcoming events
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="terms"
                              checked={acceptTerms}
                              onChange={(e) => setAcceptTerms(e.target.checked)}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <label
                              htmlFor="terms"
                              className="text-sm text-gray-700"
                            >
                              I accept the terms of service
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {wantAccount ? (
                    <button
                      onClick={handleCreateAccount}
                      disabled={
                        isCreatingAccount ||
                        !formData.name ||
                        !formData.email ||
                        !formData.password ||
                        !acceptTerms
                      }
                      className="w-full bg-gradient-to-r from-[#ff914d] to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200"
                    >
                      {isCreatingAccount ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Creating Account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={
                        isProcessingPayment || !formData.name || !formData.email
                      }
                      className="w-full bg-gradient-to-r from-[#ff914d] to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200"
                    >
                      {getButtonText()}
                    </button>
                  )}

                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setShowRegister(false);
                        setError(null);
                      }}
                      className="text-orange-600 hover:text-orange-800 font-medium"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <GoogleSignin callbackUrl={`/events/${event.id}/ticket`} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      or continue with email
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError(null);
                      }}
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={
                      isLoggingIn || !formData.email || !formData.password
                    }
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {isLoggingIn ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Logging in...
                      </div>
                    ) : (
                      "Login"
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Need an account?{" "}
                    <button
                      onClick={() => {
                        setShowRegister(true);
                        setError(null);
                      }}
                      className="text-orange-600 hover:text-orange-800 font-medium"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        )}

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
