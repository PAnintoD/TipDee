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
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'tipdee_super_secret_key_change_in_production_2026',
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.email?.split('@')[0] || 'User',
          email: profile.email,
          image: profile.picture || null,
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
        try {
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
        } catch (err) {
          console.error('[auth.ts events.signIn] Error creating streamer profile:', err);
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

      // Ensure streamerId and username are populated for OAuth sign-ins or updates
      if (token.id && (!token.streamerId || !token.username || trigger === 'update')) {
        try {
          let streamer = await prisma.streamer.findUnique({
            where: { userId: token.id as string },
          });

          // Auto-create streamer record if missing (OAuth first login)
          if (!streamer && (token.email || user?.email)) {
            const email = ((token.email || user?.email) as string);
            const baseName = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
            const safeUsername = await getUniqueUsername(baseName);
            streamer = await prisma.streamer.create({
              data: {
                userId: token.id as string,
                username: safeUsername,
                displayName: (token.name as string) || (user?.name as string) || safeUsername,
                avatarUrl: (token.picture as string) || (user?.image as string) || '',
              },
            });
          }

          if (streamer) {
            token.streamerId = streamer.id;
            token.username = streamer.username;
          }
        } catch (err) {
          console.error('[auth.ts jwt] Error ensuring streamer profile:', err);
        }
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
