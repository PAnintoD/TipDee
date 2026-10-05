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
      if (account?.provider !== 'credentials' && (user.id || user.email)) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                ...(user.id ? [{ id: user.id }] : []),
                ...(user.email ? [{ email: user.email }] : []),
              ],
            },
            include: { streamer: true },
          });

          if (dbUser && !dbUser.streamer && dbUser.email) {
            const username = dbUser.email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase();
            const safeUsername = await getUniqueUsername(username);
            await prisma.streamer.create({
              data: {
                userId: dbUser.id,
                username: safeUsername,
                displayName: dbUser.name ?? safeUsername,
                avatarUrl: dbUser.image ?? '',
                widgetSettings: {
                  create: {
                    template: '{name} โดเนท {amount} บาท: {message}',
                    minAmountForAlert: 5,
                    minAmountForTTS: 10,
                    duration: 7,
                    soundUrl: 'levelup',
                    soundVolume: 80,
                    imageUrl: '/mascot.svg',
                    ttsEnabled: true,
                    ttsVoice: 'th-TH',
                    ttsSpeed: 1.0,
                    ttsPitch: 1.0,
                    ttsVolume: 90,
                    textColor: '#00e5ff',
                    highlightColor: '#ff9800',
                    fontFamily: 'Prompt, sans-serif',
                  },
                },
                goalSettings: {
                  create: {
                    title: '🎯 เป้าหมายการโดเนท',
                    targetAmount: 1000,
                    currentAmount: 0,
                    endDate: '2026-12-31',
                    barColor: '#00a8ff',
                    backgroundColor: 'rgba(24, 24, 27, 0.85)',
                    textColor: '#ffffff',
                    showPercentage: true,
                  },
                },
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

      // Robust lookup across ID, sub, and email to ensure token.id always matches DB Primary Key
      const lookupFilters = [
        ...(token.id ? [{ id: token.id as string }] : []),
        ...(token.sub ? [{ id: token.sub }] : []),
        ...(token.email ? [{ email: token.email }] : []),
        ...(user?.email ? [{ email: user.email }] : []),
      ];

      if (lookupFilters.length > 0) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: { OR: lookupFilters },
            include: { streamer: { include: { widgetSettings: true, goalSettings: true } } },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.sub = dbUser.id;
            token.role = dbUser.role || token.role || 'STREAMER';

            let streamer = dbUser.streamer;
            if (!streamer) {
              const baseName = (dbUser.email?.split('@')[0] || dbUser.name || 'streamer')
                .replace(/[^a-z0-9_]/gi, '')
                .toLowerCase();
              const safeUsername = await getUniqueUsername(baseName);
              streamer = await prisma.streamer.create({
                data: {
                  userId: dbUser.id,
                  username: safeUsername,
                  displayName: (token.name as string) || dbUser.name || safeUsername,
                  avatarUrl: (token.picture as string) || dbUser.image || '',
                  widgetSettings: {
                    create: {
                      template: '{name} โดเนท {amount} บาท: {message}',
                      minAmountForAlert: 5,
                      minAmountForTTS: 10,
                      duration: 7,
                      soundUrl: 'levelup',
                      soundVolume: 80,
                      imageUrl: '/mascot.svg',
                      ttsEnabled: true,
                      ttsVoice: 'th-TH',
                      ttsSpeed: 1.0,
                      ttsPitch: 1.0,
                      ttsVolume: 90,
                      textColor: '#00e5ff',
                      highlightColor: '#ff9800',
                      fontFamily: 'Prompt, sans-serif',
                    },
                  },
                  goalSettings: {
                    create: {
                      title: '🎯 เป้าหมายการโดเนท',
                      targetAmount: 1000,
                      currentAmount: 0,
                      endDate: '2026-12-31',
                      barColor: '#00a8ff',
                      backgroundColor: 'rgba(24, 24, 27, 0.85)',
                      textColor: '#ffffff',
                      showPercentage: true,
                    },
                  },
                },
                include: { widgetSettings: true, goalSettings: true },
              });
            }

            if (streamer) {
              token.streamerId = streamer.id;
              token.username = streamer.username;
            }
          }
        } catch (err) {
          console.error('[auth.ts jwt] Error ensuring streamer profile:', err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
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
