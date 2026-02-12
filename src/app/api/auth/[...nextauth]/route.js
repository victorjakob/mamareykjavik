import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServerSupabase } from "@/util/supabase/server";

// Replace direct Supabase client initialization with utility function
const supabase = createServerSupabase();

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
        const { email, password } = credentials;

        // Fetch user from Supabase (including role)
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, password, name, role") // ✅ Include role
          .eq("email", email)
          .single();

        if (error || !user) {
          throw new Error("User not found");
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
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
      const { data: dbUser, error } = await supabase
        .from("users")
        .select("id, name, role, provider")
        .eq("email", token.email)
        .single();

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
        token.supabaseAccessToken = jwt.sign(payload, signingSecret);
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name;
      session.user.provider = token.provider;
      session.supabaseAccessToken = token.supabaseAccessToken; // ✅ Attach Supabase Token

      return session;
    },

    async signIn({ account, profile, user }) {
      const email = profile?.email || user?.email;
      const name = profile?.name || user?.name;

      // If we don't have an email, allow sign-in but skip role sync.
      if (!email) return true;

      // Check if this email is a manager (primary or secondary) in any events
      const { data: managedEvents } = await supabase
        .from("events")
        .select("id")
        .or(`host.eq.${email},host_secondary.eq.${email}`)
        .limit(1);

      // Determine the role based on whether they're a manager
      const desiredRole =
        managedEvents && managedEvents.length > 0 ? "host" : "user";

      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, role, provider")
        .eq("email", email)
        .single();

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
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
