import GoogleProvider from "next-auth/providers/google";

function allowedEmails() {
  return (process.env.AUTH_ALLOWED_EMAILS || process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
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
