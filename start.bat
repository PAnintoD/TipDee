@echo off
title EasyDonate Server
echo ===================================================
echo       EasyDonate - ระบบโดเนทสตรีมเมอร์ & ครีเอเตอร์
echo ===================================================
echo.
echo กำลังเริ่มต้นระบบ...
cd /d "%~dp0"

echo ตรวจสอบฐานข้อมูล Prisma...
call npx prisma db push

echo.
echo กำลังเปิดเซิร์ฟเวอร์ที่ http://localhost:3000 ...
start http://localhost:3000/dashboard
call npm run start

pause
