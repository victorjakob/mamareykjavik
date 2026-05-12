// Single source of truth for NextAuth options.
//
// Imported by the NextAuth route handler (`src/app/api/auth/[...nextauth]/route.js`)
// AND by every API route / server component that calls `getServerSession(authOptions)`.
// Keeping one shared object guarantees that the JWT/session/signIn callbacks
// behave identically when sessions are minted vs. when they're read.

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { createServerSupabase } from "@/util/supabase/server";

const supabase = createServerSupabase();

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signSupabaseJwt(payload, secret) {
  const encodedHeader = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const encodedPayload = base64UrlEncode(payload);
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Normalize email — phone keyboards often auto-capitalize or add
        // a trailing space, which breaks a case-sensitive DB lookup.
        const email = (credentials?.email || "").trim().toLowerCase();
        const password = credentials?.password || "";

        if (!email || !password) {
          throw new Error("CredentialsSignin");
        }

        // Lookup user case-insensitively to handle legacy rows that
        // were stored with mixed case before normalization existed.
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, password, name, role, provider")
          .ilike("email", email)
          .maybeSingle();

        if (error || !user) {
          throw new Error("CredentialsSignin");
        }

        // Account exists but has no password — typically because it was
        // created via Google OAuth. Guide the user to the right flow
        // instead of crashing inside bcrypt.compare(password, null).
        if (!user.password) {
          throw new Error("OAuthAccountNoPassword");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("CredentialsSignin");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, session, user, account }) {
      // Handle name updates
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      // If first sign in, assign user details
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        if (account?.provider) {
          token.provider = account.provider;
        }
      }

      // Always fetch latest user data from Supabase
      const lookupEmail = (token.email || "").trim().toLowerCase();
      const { data: dbUser, error } = await supabase
        .from("users")
        .select("id, name, role, provider")
        .ilike("email", lookupEmail)
        .maybeSingle();

      if (!error && dbUser) {
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.name = dbUser.name || token.name;
        token.provider = dbUser.provider;
      }

      // Generate Supabase JWT Token with correct payload structure
      const signingSecret = process.env.SUPABASE_JWT_SECRET;
      if (signingSecret) {
        const payload = {
          aud: "authenticated",
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hour expiry
          sub: token.id,
          email: token.email,
          role: token.role || "authenticated",
          iat: Math.floor(Date.now() / 1000),
        };
        token.supabaseAccessToken = signSupabaseJwt(payload, signingSecret);
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name;
      session.user.provider = token.provider;
      session.supabaseAccessToken = token.supabaseAccessToken;

      return session;
    },

    async signIn({ account, profile, user }) {
      const rawEmail = profile?.email || user?.email;
      const email = rawEmail ? rawEmail.trim().toLowerCase() : null;
      const name = profile?.name || user?.name;

      // If we don't have an email, allow sign-in but skip role sync.
      if (!email) return true;

      // Check if this email is a manager (primary or secondary) in any events
      const { data: managedEvents } = await supabase
        .from("events")
        .select("id")
        .or(`host.ilike.${email},host_secondary.ilike.${email}`)
        .limit(1);

      // Determine the role based on whether they're a manager
      const desiredRole =
        managedEvents && managedEvents.length > 0 ? "host" : "user";

      // Check if user exists (case-insensitive in case legacy rows
      // were stored with mixed case)
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, role, provider")
        .ilike("email", email)
        .maybeSingle();

      if (!existingUser && account?.provider === "google") {
        // Create new Google user with the determined role
        await supabase.from("users").insert([
          {
            email,
            name,
            role: desiredRole,
            provider: "google",
          },
        ]);
      } else if (existingUser) {
        // Auto-upgrade users to "host" if they manage any events
        if (existingUser.role !== "admin" && desiredRole === "host") {
          await supabase
            .from("users")
            .update({ role: "host" })
            .eq("id", existingUser.id);
        }
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      // If url is a relative URL, make it absolute
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise, redirect to baseUrl
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
};
