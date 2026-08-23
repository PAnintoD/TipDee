import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'STREAMER',
        };
      },
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { streamer: true },
        });

        if (!user || !user.passwordHash) return null;
        if (!user.active) return null;

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!passwordMatch) return null;

        // Log the login event
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            detail: 'Login via credentials',
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          streamerId: user.streamer?.id ?? null,
          username: user.streamer?.username ?? null,
        } as any;
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      // For OAuth sign-ins, create streamer profile if it doesn't exist
      if (account?.provider !== 'credentials' && user.id) {
        const existing = await prisma.streamer.findUnique({
          where: { userId: user.id },
        });
        if (!existing && user.email) {
          const username = user.email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
          const safeUsername = await getUniqueUsername(username);
          await prisma.streamer.create({
            data: {
              userId: user.id,
              username: safeUsername,
              displayName: user.name ?? safeUsername,
              avatarUrl: user.image ?? '',
            },
          });
        }
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'STREAMER';
        token.streamerId = (user as any).streamerId;
        token.username = (user as any).username;
      }
      // Refresh streamerId/username on session update
      if (trigger === 'update' && token.id) {
        const streamer = await prisma.streamer.findUnique({
          where: { userId: token.id as string },
        });
        token.streamerId = streamer?.id;
        token.username = streamer?.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).streamerId = token.streamerId;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
});

async function getUniqueUsername(base: string): Promise<string> {
  let username = base || 'streamer';
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? username : `${username}${suffix}`;
    const exists = await prisma.streamer.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
    suffix++;
  }
}
