'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  FileText,
  Calculator,
  Download,
  AlertCircle,
  Percent,
} from 'lucide-react';

export default function TaxAssistantPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [annualIncome, setAnnualIncome] = useState(0);
  const [personalAllowance] = useState(60000); // ค่าลดหย่อนส่วนตัว 60,000฿
  const [otherAllowance, setOtherAllowance] = useState(0); // ประกันสังคม / ประกันชีวิต

  useEffect(() => {
    fetch(`/api/analytics?streamerId=${username}&period=all`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && typeof res.data?.totalRevenue === 'number') {
          setAnnualIncome(res.data.totalRevenue);
        }
      })
      .catch((e) => console.error(e));
  }, [username]);

  // 40(8) Streamer income: 50% max 100,000฿ standard deduction
  const expenseDeduction = Math.min(100000, annualIncome * 0.5);
  const totalDeduction = expenseDeduction + personalAllowance + otherAllowance;
  const netTaxableIncome = Math.max(0, annualIncome - totalDeduction);

  // Thai Progressive Tax Rate Calculation
  let estimatedTax = 0;
  if (netTaxableIncome <= 150000) {
    estimatedTax = 0;
  } else if (netTaxableIncome <= 300000) {
    estimatedTax = (netTaxableIncome - 150000) * 0.05;
  } else if (netTaxableIncome <= 500000) {
    estimatedTax = 7500 + (netTaxableIncome - 300000) * 0.10;
  } else if (netTaxableIncome <= 750000) {
    estimatedTax = 27500 + (netTaxableIncome - 500000) * 0.15;
  } else if (netTaxableIncome <= 1000000) {
    estimatedTax = 65000 + (netTaxableIncome - 750000) * 0.20;
  } else {
    estimatedTax = 115000 + (netTaxableIncome - 1000000) * 0.25;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Calculator className="h-6 w-6 text-emerald-600" />
                <span>ผู้ช่วยภาษีสตรีมเมอร์ (Tax Assistant ภ.ง.ด. 90/91)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                สรุปรายรับโดเนทจริงจากระบบและคำนวณประมาณการภาษีเงินได้บุคคลธรรมดาตามหลักเกณฑ์สรรพากร
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 shadow-2xs transition-all hover:scale-105"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              <span>พิมพ์ใบสรุปรายงานภาษี</span>
            </button>
          </div>

          {/* Warning notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              เงินได้จากการรับโดเนทถือเป็นเงินได้พึงประเมินตามประมวลรัษฎากร (มาตรา 40(8)) สตรีมเมอร์ที่มีรายได้สุทธิเกิน 150,000 บาทต่อปี มีหน้าที่ยื่นแบบแสดงรายการภาษีประจำปี (ภ.ง.ด. 90/94)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input & Deductions */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">ข้อมูลรายรับจริงจากระบบ & ค่าลดหย่อน</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ยอดเงินโดเนทสะสมตลอดทั้งปี (บาท)
                  </label>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                    min={0}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">ดึงยอดจริงจากประวัติโดเนทที่สำเร็จของคุณ</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ค่าลดหย่อนส่วนตัว (ตามกฎหมายกำหนด)
                  </label>
                  <input
                    type="text"
                    value="60,000 บาท"
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ค่าลดหย่อนอื่นๆ เพิ่มเติม (ประกันสังคม, ประกันชีวิต, กองทุน)
                  </label>
                  <input
                    type="number"
                    value={otherAllowance}
                    onChange={(e) => setOtherAllowance(Number(e.target.value))}
                    min={0}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Tax Computation Summary */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Percent className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">ผลการคำนวณภาษีสะสม</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">1. เงินได้พึงประเมินรวม</span>
                    <span className="font-bold text-slate-900">{annualIncome.toLocaleString()} ฿</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">2. หักค่าใช้จ่าย 50% (สูงสุด 100,000฿)</span>
                    <span className="font-bold text-emerald-600">- {expenseDeduction.toLocaleString()} ฿</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">3. หักลดหย่อนส่วนตัว & อื่นๆ</span>
                    <span className="font-bold text-emerald-600">- {(personalAllowance + otherAllowance).toLocaleString()} ฿</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-700 font-bold">4. เงินได้สุทธิที่ต้องเสียภาษี</span>
                    <span className="font-black text-slate-900 text-sm">{netTaxableIncome.toLocaleString()} ฿</span>
                  </div>
                </div>
              </div>

              {/* Tax to pay */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1 mt-4">
                <span className="text-xs text-emerald-800 font-semibold">ประมาณการภาษีเงินได้ที่ต้องชำระ:</span>
                <p className="text-3xl font-black text-emerald-600">
                  {estimatedTax.toLocaleString('th-TH')} <span className="text-sm font-bold text-slate-700">บาท</span>
                </p>
                <p className="text-[10px] text-emerald-700 font-medium">
                  {estimatedTax === 0 ? '✓ ได้รับยกเว้นภาษี (เงินได้สุทธิไม่เกิน 150,000 บาท)' : 'คำนวณตามอัตราภาษีแบบขั้นบันได 5% - 35%'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
