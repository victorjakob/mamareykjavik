import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerSupabase } from "@/util/supabase/server";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const supabase = createClientComponentClient();

          const {
            data: { user },
            error,
          } = await supabase.auth.signInWithPassword({
            email: credentials?.email || "",
            password: credentials?.password || "",
          });

          if (error) {
            return null;
          }

          // Fetch user role from database
          const serverSupabase = createServerSupabase();
          const { data: dbUser } = await serverSupabase
            .from("users")
            .select("id, email, name, role")
            .eq("email", user.email)
            .single();

          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || dbUser?.name,
            role: dbUser?.role || "user",
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      
      // Always fetch latest user data from Supabase to ensure role is up to date
      if (token.email) {
        const serverSupabase = createServerSupabase();
        const { data: dbUser } = await serverSupabase
          .from("users")
          .select("id, name, role")
          .eq("email", token.email)
          .single();
        
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name || token.name;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
};
