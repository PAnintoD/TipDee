# Database Migration Guide: SQLite to PostgreSQL (Production Readiness)

คู่มือสำหรับการย้ายฐานข้อมูลจาก Local SQLite (`prisma/dev.db`) ไปยัง Managed PostgreSQL บน Production (Supabase, Neon, Railway, AWS RDS) เพื่อรองรับ High-Concurrency, Connection Pooling (PgBouncer) และขจัดการล็อกฐานข้อมูล (`SQLITE_BUSY`).

---

## 1. ข้อจำกัดของ SQLite บน Production
1. **Single Writer Lock**: SQLite อนุญาตให้เขียนฐานข้อมูลได้ทีละ 1 Connection หากมีการโดเนทหรือสแกนสลิปพร้อมกันจำนวนมาก ระบบจะสะดุดด้วย `SQLITE_BUSY: database is locked`.
2. **Serverless Filesystem**: บน Vercel หรือ Cloud Run ไฟล์ระบบเป็น Read-only หรือ Ephemeral ทำให้ข้อมูลที่เขียนลง SQLite สูญหายเมื่อ Container ดับหรือหมุนเวียน instance.

---

## 2. ขั้นตอนการตั้งค่า PostgreSQL สำหรับ Production

### ขั้นที่ 1: เตรียม Connection String
สมัครบริการ Managed PostgreSQL (แนะนำฟรีและเสถียรสูง เช่น [Neon.tech](https://neon.tech) หรือ [Supabase](https://supabase.com))
และเปิดใช้งาน Connection Pooling (PgBouncer) จะได้ URL ในรูปแบบ:

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:6543/[DBNAME]?pgbouncer=true&connection_limit=20"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/[DBNAME]"
```

### ขั้นที่ 2: Deploy Schema ไปยัง PostgreSQL
ใน TipDee ได้เตรียม Schema สำหรับ PostgreSQL ไว้เรียบร้อยแล้วที่ `prisma/schema.postgresql.prisma`

รันคำสั่ง:
```bash
npx prisma db push --schema=prisma/schema.postgresql.prisma
```
หรือสลับ `provider = "postgresql"` ในไฟล์ `prisma/schema.prisma` หลักโดยตรง

### ขั้นที่ 3: สลับ Provider ใน prisma/schema.prisma
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // ไม่บังคับ - ใช้สำหรับการทำ migration ผ่าน Prisma CLI
}
```

แล้วรัน:
```bash
npx prisma generate
```

---

## 3. การเพิ่มประสิทธิภาพการเชื่อมต่อ (Prisma Connection Pooling)
- แนะนำให้ต่อผ่าน **PgBouncer** หรือ **Prisma Accelerate** เพื่อรองรับการเปิดเชื่อมต่อพร้อมกันหลักพันการเชื่อมต่อ โดยไม่เกิน Pool Limit ของ Database Server
- บน Next.js Serverless runtime ให้เพิ่มพารามิเตอร์ `connection_limit=10` ใน `DATABASE_URL`
