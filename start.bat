@echo off
title TipDee - ระบบโดเนทสตรีมเมอร์
echo =========================================================
echo       TipDee - ระบบโดเนทสตรีมเมอร์ & ครีเอเตอร์
echo =========================================================
echo.
echo กำลังเริ่มต้นระบบ...
cd /d "%~dp0"

echo [1/3] ตรวจสอบฐานข้อมูล Prisma...
call npx prisma db push

echo.
echo [2/3] ตรวจสอบความพร้อมของระบบ...
if not exist ".next" (
    echo กำลัง Build ระบบครั้งแรก...
    call npm run build
)

echo.
echo [3/3] เปิดหน้าต่างควบคุมที่ http://localhost:3000/dashboard ...
start http://localhost:3000/dashboard

echo.
echo =========================================================
echo  ระบบ TipDee กำลังทำงาน! สามารถปิดหน้านี้เมื่อเลิกใช้งาน
echo =========================================================
call npm run start

pause
