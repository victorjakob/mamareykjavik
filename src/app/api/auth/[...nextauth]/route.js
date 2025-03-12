import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

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
      // Handle name updates from session
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      // If user object exists (first sign in)
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
        token.name = dbUser.name || token.name; // Preserve existing name if not in DB
        token.provider = dbUser.provider;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name;
      session.user.provider = token.provider;
      return session;
    },

    async signIn({ account, profile }) {
      if (account.provider === "google") {
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("email", profile.email)
          .single();

        if (!existingUser) {
          const { error: insertError } = await supabase.from("users").insert([
            {
              email: profile.email,
              name: profile.name,
              role: "user",
              provider: "google",
            },
          ]);

          if (insertError) {
            console.error("❌ Supabase Insert Error:", insertError.message);
            return false;
          }
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
