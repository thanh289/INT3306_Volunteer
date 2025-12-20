// Configures NextAuth.js and handles all authentication-related API requests (login, logout, callback, session)
// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { UserStatus } from "@prisma/client";
import { authRateLimiter } from "@/lib/rate-limit";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true, // Allows linking if email exists
    }),

    // Traditional Credentials Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        // Rate limiting for login attempts
        if (req?.headers) {
          // req.headers is a Headers object, so we need to extract the IP differently
          const forwardedFor = req.headers["x-forwarded-for"];
          const realIp = req.headers["x-real-ip"];
          const identifier =
            forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

          const rateLimit = await authRateLimiter.check(identifier);
          if (!rateLimit.success) {
            throw new Error(
              `Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${Math.ceil(
                (rateLimit.reset - Date.now()) / 1000 / 60
              )} phút.`
            );
          }
        }

        // Check whether type email and pw
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        // find user in db
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Người dùng không tồn tại");
        }

        // check status
        if (user.status === "LOCKED") {
          throw new Error("Tài khoản này đã bị khóa.");
        }

        // check pw
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordCorrect) {
          throw new Error("Mật khẩu không chính xác");
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],

  // view types/next-auth.d.ts
  // This callback is called whenever a JWT is created (i.e., at sign-in).
  // We are adding the user ID from the database to the token here.
  callbacks: {
    // Handle account linking and user creation for OAuth
    async signIn({ user, account, profile }) {
      // Allow credentials provider to work as before
      if (account?.provider === "credentials") {
        return true;
      }

      // For OAuth providers (Google, Email)
      if (account?.provider === "google" || account?.provider === "email") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // If user exists, check status
          if (existingUser) {
            if (existingUser.status === "LOCKED") {
              return false; // Don't allow locked users to sign in
            }

            // Update user info from OAuth if needed
            if (account.provider === "google" && profile) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  name: user.name || existingUser.name,
                },
              });
            }
          } else {
            // Create new user for OAuth sign-in
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                passwordHash: undefined, // No password for OAuth users
                role: "VOLUNTEER",
                status: "ACTIVE",
              },
            });
            user.id = newUser.id;
          }

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },

    // called when a JWT is created
    async jwt({ token, user, trigger, account }) {
      // First sign in with OAuth
      if (account && user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.imageUrl = dbUser.imageUrl;
          token.name = dbUser.name;
        }
      }

      // Regular update for credentials
      if (user && !account) {
        token.id = user.id; // add user's ID into token
        token.role = user.role;
        token.status = user.status;
        token.imageUrl = user.imageUrl;
        token.name = user.name;
      }

      // use const {update} = useSession() -> await update() for for jwt trigger
      if (trigger === "update") {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { imageUrl: true, status: true, name: true },
        });

        if (freshUser) {
          token.imageUrl = freshUser.imageUrl;
          token.status = freshUser.status;
          token.name = freshUser.name;
        }
      }
      return token;
    },
    // called when a token is accessed
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        // take status from db each time session is called
        const userFromDb = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { status: true, imageUrl: true, name: true },
        });
        session.user.status = userFromDb?.status || UserStatus.LOCKED;
        session.user.imageUrl = userFromDb?.imageUrl || null;
        session.user.name = userFromDb?.name || session.user.name;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt", // use jwt to mange session
  },
  secret: process.env.NEXTAUTH_SECRET, // JWT secret key
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
