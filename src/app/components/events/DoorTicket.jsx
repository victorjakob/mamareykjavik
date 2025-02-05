"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PropagateLoader } from "react-spinners";
import { format } from "date-fns";
import Image from "next/image";
import {
  signUpUser,
  defaultFormValues,
  formValidation,
} from "@/util/auth-util";
import { useForm } from "react-hook-form";

/**
 * DoorTicket component handles door ticket reservations for events
 * Allows users to reserve tickets to pay at the door, with options for:
 * - Guest checkout
 * - Login for existing users
 * - New account creation during reservation
 */
export default function DoorTicket() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  // State management
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showRegister, setShowRegister] = useState(true);
  const [wantAccount, setWantAccount] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  // Form handling for registration
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm({
    defaultValues: defaultFormValues,
  });

  // Form handling for login
  const {
    register: loginForm,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Fetch event details and handle authentication state
  useEffect(() => {
    const fetchEventAndUser = async () => {
      try {
        // Get event details first since we need this regardless of auth state
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("slug", slug)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Then try to get user if they're logged in
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!userError && user) {
          setUser(user);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("user_id", user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching initial data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventAndUser();

    // Handle auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        setUser(currentUser || null);

        if (currentUser) {
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("name")
              .eq("user_id", currentUser.id)
              .single();
            setProfile(profileData);
          } catch (err) {
            console.error("Error fetching profile:", err);
          }
        } else {
          setProfile(null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [slug]);

  /**
   * Handles user login
   * @param {Object} data - Form data containing email and password
   */
  const onLogin = async (data) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  /**
   * Handles ticket registration and optional account creation
   * @param {Object} data - Form data containing user details
   */
  const onRegister = async (data) => {
    setProcessing(true);
    setError(null);

    try {
      let ticketUser = user;
      let buyerName = user ? profile?.name : data.name;
      let buyerEmail = user ? user.email : data.email;

      // Handle account creation if requested
      if (!user && wantAccount && data.password) {
        try {
          ticketUser = await signUpUser({
            email: data.email,
            password: data.password,
            name: data.name,
            termsAccepted: true,
            emailSubscription: subscribeNewsletter,
          });
        } catch (err) {
          setError(err.message);
          setProcessing(false);
          return;
        }
      }

      // Create ticket record
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .insert([
          {
            event_id: event.id,
            buyer_email: buyerEmail,
            buyer_name: buyerName,
            quantity: 1,
            status: "door",
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
              price: event.price,
              duration: event.duration,
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
      if (ticketUser) {
        router.push("/profile/my-tickets");
      } else {
        router.push(`/events/ticket-confirmation`);
      }
    } catch (err) {
      setError(err.message);
      console.error("Ticket creation error:", err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  // Error state - event not found
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Event not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 py-16 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
          <div className="border-b pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-24 aspect-[16/9]">
                <Image
                  src={event.image}
                  alt={event.name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 96px) 100vw, 96px"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {event.name}
                </h1>
                <p className="text-sm text-gray-500 mt-2">Event Registration</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Date</span>
              <span className="text-gray-900 font-medium">
                {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Time</span>
              <span className="text-gray-900 font-medium">
                {format(new Date(event.date), "h:mm a")}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Duration</span>
              <span className="text-gray-900 font-medium">
                {event.duration} hours
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Location</span>
              <span className="text-gray-900 font-medium">
                Bankastræti 2, 101 Reykjavik
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Price</span>
              <span className="text-gray-900 font-medium">
                {event.price} ISK
              </span>
            </div>
          </div>

          <div className="border-b pb-1 mb-6">{/* Border added here */}</div>

          {user ? (
            // Logged in user view
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">Name: {profile?.name}</p>
                <p className="text-gray-600">Email: {user.email}</p>
              </div>
              <button
                onClick={handleRegisterSubmit(onRegister)}
                disabled={processing}
                className="w-full py-3 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? "Processing..." : "Reserve Ticket - Pay at Door"}
              </button>
            </div>
          ) : (
            // Guest/Login view
            <div>
              {error && (
                <div
                  className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {showRegister ? (
                <>
                  <p className="mb-4 text-xs">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegister(false);
                        setError(null);
                        resetRegisterForm();
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Login here
                    </button>
                  </p>

                  <form
                    onSubmit={handleRegisterSubmit(onRegister)}
                    className="space-y-4"
                  >
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        {...registerForm("name", formValidation.name)}
                        className="w-full p-2 border rounded"
                        aria-label="Name"
                      />
                      {registerErrors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {registerErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        {...registerForm("email", formValidation.email)}
                        className="w-full p-2 border rounded"
                        aria-label="Email"
                      />
                      {registerErrors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {registerErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="createAccount"
                        checked={wantAccount}
                        onChange={(e) => setWantAccount(e.target.checked)}
                        aria-label="Create account option"
                      />
                      <label htmlFor="createAccount">Create an account?</label>
                    </div>

                    {wantAccount && (
                      <>
                        <div>
                          <input
                            type="password"
                            placeholder="Password"
                            {...registerForm(
                              "password",
                              formValidation.password
                            )}
                            className="w-full p-2 border rounded"
                            aria-label="Password"
                          />
                          {registerErrors.password && (
                            <p className="text-red-500 text-xs mt-1">
                              {registerErrors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="newsletter"
                            checked={subscribeNewsletter}
                            onChange={(e) =>
                              setSubscribeNewsletter(e.target.checked)
                            }
                            aria-label="Newsletter subscription"
                          />
                          <label htmlFor="newsletter">
                            Subscribe to newsletter
                          </label>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-3 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {processing
                        ? "Processing..."
                        : "Reserve Ticket - Pay at Door"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    Need an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegister(true);
                        setError(null);
                        resetLoginForm();
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Register here
                    </button>
                  </p>

                  <form
                    onSubmit={handleLoginSubmit(onLogin)}
                    className="space-y-4"
                  >
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        {...loginForm("email", {
                          required: "Email is required",
                        })}
                        className="w-full p-2 border rounded"
                        aria-label="Email"
                      />
                      {loginErrors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {loginErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        {...loginForm("password", {
                          required: "Password is required",
                        })}
                        className="w-full p-2 border rounded"
                        aria-label="Password"
                      />
                      {loginErrors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {loginErrors.password.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 px-4 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoggingIn ? "Logging in..." : "Login"}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
