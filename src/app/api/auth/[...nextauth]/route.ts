import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createUser, fetchUserByEmail, updateUser } from "../../../lib/data";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user already exists
          let dbUser = await fetchUserByEmail(user.email);

          if (!dbUser) {
            // Create new user with avatar
            dbUser = await createUser({
              email: user.email,
              full_name: user.name || "",
            });

            // Update avatar if available
            if (user.image) {
              dbUser = await updateUser(dbUser.id, {
                avatar_url: user.image,
              });
            }
          } else {
            // Update existing user's avatar if it has changed or is missing
            const shouldUpdateAvatar = user.image &&
              (!dbUser.avatar_url || dbUser.avatar_url !== user.image);

            if (shouldUpdateAvatar) {
              dbUser = await updateUser(dbUser.id, {
                avatar_url: user.image || undefined,
              });
            }
          }

          // Store the database user ID for use in JWT
          user.id = dbUser.id;

          return true;
        } catch (error) {
          console.error("Error handling user signin:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.userId || token.sub; // prefer userId if available
        session.user.email = token.email;
      }
      return session;
    },

    async jwt({ user, token, account }) {

      if (user && account) {
        // Store the database user ID in the token
        token.sub = user.id;
        token.userId = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };
