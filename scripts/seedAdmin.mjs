import { readFileSync } from 'fs';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Load .env.local manually
const envFile = readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && key.trim() && !key.trim().startsWith('#')) {
    process.env[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const ADMIN_EMAIL = 'admin@tipdee.app';      // เปลี่ยนเป็นอีเมลจริงของคุณ
const ADMIN_PASSWORD = 'TipDee2026!Admin';   // เปลี่ยนรหัสผ่านหลังจาก seed
const ADMIN_USERNAME = 'streamerza';

async function main() {
  console.log('🌱 Seeding admin user...\n');

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log('⚠️  Admin user already exists. Skipping.');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    const streamer = await prisma.streamer.findUnique({ where: { userId: existing.id } });
    if (streamer) console.log(`   Streamer username: ${streamer.username}`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const widgetToken = crypto.randomBytes(16).toString('hex');

  const user = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: 'Admin TipDee',
      role: 'ADMIN',
      emailVerified: new Date(),
      streamer: {
        create: {
          username: ADMIN_USERNAME,
          displayName: 'Admin TipDee',
          widgetToken,
          goalSettings: {
            create: {
              title: 'เป้าหมายการโดเนท',
              targetAmount: 1000,
              currentAmount: 0,
            },
          },
          widgetSettings: {
            create: {},
          },
        },
      },
    },
    include: { streamer: true },
  });

  console.log('✅ Admin user created successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log(`  Role     : ADMIN`);
  console.log(`  Username : ${ADMIN_USERNAME}`);
  console.log(`  Widget   : ${widgetToken}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  กรุณาเปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบครั้งแรก!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
