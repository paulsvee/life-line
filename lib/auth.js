import GoogleProvider from "next-auth/providers/google";

function authProviders() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return [];
  }

  return [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ];
}

export function isAuthConfigured() {
  return Boolean(
    (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET) &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
  );
}

function allowedEmails() {
  return (process.env.AUTH_ALLOWED_EMAILS || process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const authOptions = {
  providers: authProviders(),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      const emails = allowedEmails();
      if (!emails.length) return true;
      return user?.email ? emails.includes(user.email.toLowerCase()) : false;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
