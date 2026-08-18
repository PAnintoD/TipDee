# EasyDonate - ระบบรับเงินโดเนทสตรีมเมอร์ & ครีเอเตอร์

ระบบรับบริจาค/โดเนทสำหรับสตรีมเมอร์และคอนเทนต์ครีเอเตอร์แบบครบวงจร (Full-Stack) ถอดแบบระบบจาก EasyDonate พร้อม OBS Widgets, Dynamic PromptPay QR, ระบบสแกนสลิปอัตโนมัติ (Slip Verification), เสียงอ่านภาษาไทย (TTS) และเชื่อมต่อฐานข้อมูล Prisma ORM / Firebase

---

## 🌟 ฟีเจอร์เด่น (Key Features)

- ⚡ **PromptPay Dynamic QR Code:** สร้าง QR Code พร้อมเพย์ตามมาตรฐาน EMVCo ระบุจำนวนเงินอัตโนมัติ สแกนจ่ายได้ทุกธนาคาร
- 🧾 **Auto Slip Verification:** ถอดรหัส QR Code บนสลิปธนาคาร ป้องกันการนำสลิปเก่ามาใช้ซ้ำ (Anti-Duplicate)
- 🔔 **OBS Alert Box Widget:** กล่องแจ้งเตือนขึ้นจอ OBS Studio / TikTok Live Studio พื้นหลังโปร่งใส (Transparent 100%)
- 🗣️ **Thai & English TTS:** เสียงสังเคราะห์อ่านชื่อผู้บริจาคและข้อความภาษาไทยอัตโนมัติ
- 🎯 **Donation Goal Bar:** แถบเป้าหมายการระดมทุน อัปเดต % ความคืบหน้าแบบ Real-time
- 🏆 **Top Donors Leaderboard:** บอร์ดแสดงอันดับผู้สนับสนุนสูงสุดประจำวัน สัปดาห์ เดือน
- 📊 **Streamer Dashboard:** แดชบอร์ดควบคุมระบบ สถิติรายได้ ประวัติโดเนท และส่งออกไฟล์ CSV
- 💾 **Dual Database Engine:** รองรับทั้ง Prisma ORM (SQLite / PostgreSQL) และ Firebase Cloud Firestore

---

## 🚀 วิธีติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. เตรียมฐานข้อมูล
```bash
npx prisma db push
```

### 3. รันเซิร์ฟเวอร์
```bash
npm run dev
# หรือสำหรับการใช้งานจริง (Production)
npm run build
npm run start
```

---

## 🎥 การนำ Widget ไปใส่ใน OBS Studio

1. เปิดโปรแกรม **OBS Studio**
2. ในช่อง **Sources** กดปุ่ม **+** เลือก **Browser**
3. ใส่ URL ของ Widget:
   - **Alert Box:** `http://localhost:3000/widget/alert/streamerza` *(ขนาด: 800 x 600)*
   - **Donation Goal:** `http://localhost:3000/widget/goal/streamerza` *(ขนาด: 600 x 120)*
   - **Top Donors:** `http://localhost:3000/widget/top-donors/streamerza` *(ขนาด: 350 x 450)*
4. ติ๊กถูกที่ **"Shutdown source when not visible"** และกด **OK**

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
donate/
├── app/
│   ├── api/                  # Backend API Routes (Donations, Streamer, Slip, Realtime)
│   ├── dashboard/            # Streamer Dashboard UI
│   ├── u/[username]/         # Public Donor Donation Page
│   └── widget/               # OBS Browser Source Overlays (Alert, Goal, Top Donors)
├── components/               # Reusable UI Components
├── lib/
│   ├── db.ts                 # Database Service Layer
│   ├── prisma.ts             # Prisma Client Instance
│   ├── firebase.ts           # Firebase Client SDK
│   ├── firebaseAdmin.ts      # Firebase Admin SDK
│   ├── promptpay.ts          # PromptPay EMVCo Generator
│   ├── slipScanner.ts        # QR Code Slip Scanner & Anti-Duplicate
│   ├── soundEffects.ts       # Web Audio Synthesizer & Sound Presets
│   └── ttsEngine.ts          # Web Speech API TTS Engine
├── prisma/
│   └── schema.prisma         # Prisma Schema Definition
└── public/                   # Static Assets & Icons
```
