import { supabase } from "@/lib/supabase";
import Cookies from "js-cookie";

export const signUpUser = async ({
  email,
  password,
  name,
  termsAccepted,
  emailSubscription,
}) => {
  if (!termsAccepted) {
    throw new Error("You must accept the terms of service");
  }

  const guestId = Cookies.get("guest_id");

  // Step 1: Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (signUpError) throw signUpError;

  const user = signUpData.user;
  if (!user) throw new Error("User signup failed, no user object returned");

  // Step 2: Insert user data into the "profiles" table
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      user_id: user.id,
      name,
      email_subscription: emailSubscription,
      email,
    },
  ]);

  if (profileError) throw profileError;

  // Step 3: Update guest cart to user cart if exists
  if (guestId) {
    try {
      await supabase
        .from("carts")
        .update({
          guest_id: null,
          email: email,
        })
        .eq("guest_id", guestId)
        .eq("status", "pending");

      // Remove guest_id cookie
      Cookies.remove("guest_id");
    } catch (error) {
      console.error("Error converting guest cart to user cart:", error);
    }
  }

  return user;
};

export const defaultFormValues = {
  email: "",
  password: "",
  name: "",
  termsAccepted: false,
  emailSubscription: false,
};

export const formValidation = {
  name: {
    required: "Name is required",
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  },
  termsAccepted: {
    required: "You must accept the terms of service",
  },
};
