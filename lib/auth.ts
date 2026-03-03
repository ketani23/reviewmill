import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertBusiness } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/business.manage",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? undefined;
        token.googleAccountId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.googleAccountId = token.googleAccountId;
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          await upsertBusiness({
            owner_email: user.email,
            business_name: user.name,
            google_account_id: account.providerAccountId,
            google_access_token: account.access_token,
            google_refresh_token: account.refresh_token,
          });
        } catch (err) {
          // Log but don't block sign-in if Supabase write fails
          console.error("Failed to upsert business record:", err);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/dashboard",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
