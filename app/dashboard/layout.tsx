import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Ensure streamer profile exists for the user
  const userId = session.user.id;
  if (userId) {
    const streamer = await prisma.streamer.findUnique({ where: { userId } });
    if (!streamer) {
      // Create a default streamer profile
      const username = (session.user.email ?? '').split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() || 'streamer';
      let safeUsername = username;
      let suffix = 0;
      while (true) {
        const candidate = suffix === 0 ? safeUsername : `${safeUsername}${suffix}`;
        const exists = await prisma.streamer.findUnique({ where: { username: candidate } });
        if (!exists) { safeUsername = candidate; break; }
        suffix++;
      }
      await prisma.streamer.create({
        data: {
          userId,
          username: safeUsername,
          displayName: session.user.name ?? safeUsername,
          avatarUrl: session.user.image ?? '',
        },
      });
    }
  }

  return <>{children}</>;
}
