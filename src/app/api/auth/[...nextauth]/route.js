import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // ✅ Import JSON Web Token

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key for admin access
);

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

      console.log("🟢 NextAuth Session Object:", session); // ✅ Debug Session

      return session;
    },

    async signIn({ account, profile }) {
      if (account.provider === "google") {
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", profile.email)
          .single();

        if (!existingUser) {
          await supabase.from("users").insert([
            {
              email: profile.email,
              name: profile.name,
              role: "user",
              provider: "google",
            },
          ]);
        }
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
