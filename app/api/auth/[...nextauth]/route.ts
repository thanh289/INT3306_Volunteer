// Configures NextAuth.js and handles all authentication-related API requests (login, logout, callback, session)

import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
    providers: [
        // only use email and password, no need of OAuth
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },


            async authorize(credentials) {
                // Check whether type email and pw
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Vui lòng nhập email và mật khẩu');
                }

                // find user in db
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.passwordHash) {
                    throw new Error('Người dùng không tồn tại');
                }

                // checkpw
                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isPasswordCorrect) {
                    throw new Error('Mật khẩu không chính xác');
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
        // called when a JWT is created
        jwt({ token, user }) {
            if (user) {
                token.id = user.id; // add user's ID into token
                token.role = user.role;
            }
            return token;
        },
        // called when a token is accessed
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },

    session: {
        strategy: 'jwt', // use jwt to mange session
    },
    secret: process.env.NEXTAUTH_SECRET, // JWT secret key
    debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };