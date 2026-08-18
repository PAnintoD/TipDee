'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  ReceiptText,
  Search,
  Download,
  RotateCcw,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  QrCode,
  CreditCard,
  Sparkles,
  Receipt,
  Eye,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSlipImage, setSelectedSlipImage] = useState<string | null>(null);

  const streamerId = 'streamerza';

  const fetchDonations = async () => {
    try {
      const res = await fetch(`/api/donations?streamerId=${streamerId}`);
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
        setFiltered(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = [...donations];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.donorName.toLowerCase().includes(query) ||
          (d.message && d.message.toLowerCase().includes(query)) ||
          d.amount.toString().includes(query)
      );
    }

    if (methodFilter !== 'all') {
      result = result.filter((d) => d.paymentMethod === methodFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    setFiltered(result);
  }, [search, methodFilter, statusFilter, donations]);

  const handleReplay = async (donationId: string) => {
    setReplayingId(donationId);
    try {
      await fetch('/api/donations/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, streamerId }),
      });
      setTimeout(() => setReplayingId(null), 800);
    } catch (e) {
      console.error(e);
      setReplayingId(null);
    }
  };

  const handleDelete = async (donationId: string) => {
    if (!confirm('คุณต้องการลบรายการโดเนทนี้ใช่หรือไม่?')) return;
    setDeletingId(donationId);
    try {
      const res = await fetch('/api/donations/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: donationId }),
      });
      if (res.ok) {
        setDonations((prev) => prev.filter((d) => d.id !== donationId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['ID', 'วันที่', 'เวลา', 'ชื่อผู้บริจาค', 'จำนวนเงิน(บาท)', 'ข้อความ', 'ช่องทางชำระเงิน', 'สถานะ', 'รหัสสลิป'];
    const rows = filtered.map((d) => {
      const dt = new Date(d.createdAt);
      const dateStr = dt.toLocaleDateString('th-TH');
      const timeStr = dt.toLocaleTimeString('th-TH');
      return [
        `"${d.id}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${(d.donorName || '').replace(/"/g, '""')}"`,
        d.amount,
        `"${(d.message || '').replace(/"/g, '""')}"`,
        `"${d.paymentMethod}"`,
        `"${d.status}"`,
        `"${d.slipRef || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `donations_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFilteredAmount = filtered.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                <ReceiptText className="h-6 w-6 text-brand-400" />
                <span>ประวัติรายการโดเนท (Donation History & Slips)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                บันทึกบนฐานข้อมูล Prisma ตรวจสอบสลิป ย้อนดูประวัติ และเล่นการแจ้งเตือนซ้ำบน OBS
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="h-4 w-4 text-brand-400" />
              <span>ส่งออกไฟล์ CSV ({filtered.length} รายการ)</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl border border-white/10 bg-[#0e1219]/90 backdrop-blur-md grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อผู้บริจาค, ข้อความ, ยอดเงิน..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Payment Method Filter */}
            <div>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="all">ช่องทางชำระเงินทั้งหมด</option>
                <option value="promptpay">พร้อมเพย์ (PromptPay QR)</option>
                <option value="slip">สลิปโอนเงิน (Slip Scan)</option>
                <option value="truemoney">ซองของขวัญทรูมันนี่ (TrueMoney)</option>
                <option value="test">การทดสอบ (Test Mode)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="completed">สำเร็จ (Completed)</option>
                <option value="pending">รอดำเนินการ (Pending)</option>
              </select>
            </div>
          </div>

          {/* Summary Badge */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              พบทั้งหมด <strong className="text-white">{filtered.length}</strong> รายการ
            </span>
            <span>
              ยอดเงินรวม: <strong className="text-brand-400 font-bold">{totalFilteredAmount.toLocaleString('th-TH')} ฿</strong>
            </span>
          </div>

          {/* Donations Table */}
          <div className="rounded-2xl border border-white/10 bg-[#0e1219]/90 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">วันที่/เวลา</th>
                    <th className="px-5 py-3.5 font-bold">ผู้บริจาค (Donor)</th>
                    <th className="px-5 py-3.5 font-bold">จำนวนเงิน</th>
                    <th className="px-5 py-3.5 font-bold">ข้อความ (Message)</th>
                    <th className="px-5 py-3.5 font-bold">ช่องทาง</th>
                    <th className="px-5 py-3.5 font-bold">สถานะ / หลักฐาน</th>
                    <th className="px-5 py-3.5 font-bold text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                        ไม่พบข้อมูลรายการโดเนทที่ตรงกับเงื่อนไข
                      </td>
                    </tr>
                  ) : (
                    filtered.map((d) => {
                      const dt = new Date(d.createdAt);
                      const isReplaying = replayingId === d.id;
                      const isDeleting = deletingId === d.id;

                      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                      const formattedDate = `${dt.getDate()} ${thaiMonths[dt.getMonth()]} ${dt.getFullYear() + 543}`;
                      const formattedTime = dt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

                      return (
                        <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap text-slate-400 font-mono">
                            <div className="text-slate-200 font-semibold">{formattedDate}</div>
                            <div className="text-[11px] text-slate-500">{formattedTime}</div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                                {d.donorName.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-white">{d.donorName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-sm font-black text-brand-400">
                              +{d.amount.toLocaleString('th-TH')} ฿
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="max-w-xs truncate text-slate-200 font-medium" title={d.message}>
                              {d.message || <span className="text-slate-600 italic">- ไม่มีข้อความ -</span>}
                            </p>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {d.paymentMethod === 'slip' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
                                <Receipt className="h-3.5 w-3.5" /> สลิปธนาคาร
                              </span>
                            )}
                            {d.paymentMethod === 'promptpay' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold text-[11px]">
                                <QrCode className="h-3.5 w-3.5" /> PromptPay
                              </span>
                            )}
                            {d.paymentMethod === 'truemoney' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold text-[11px]">
                                🎁 TrueMoney
                              </span>
                            )}
                            {d.paymentMethod === 'test' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 font-bold text-[11px]">
                                ⚡ ทดสอบ
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {d.status === 'completed' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> สำเร็จ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                                  <Clock className="h-3.5 w-3.5" /> รอดำเนินการ
                                </span>
                              )}

                              {d.slipImage && (
                                <button
                                  onClick={() => setSelectedSlipImage(d.slipImage)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 text-[11px] font-semibold border border-white/10 transition-colors"
                                  title="ดูภาพสลิปหลักฐาน"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>ดูสลิป</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleReplay(d.id)}
                                disabled={isReplaying}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                                title="ยิงการแจ้งเตือนนี้ขึ้น OBS ซ้ำ"
                              >
                                <RotateCcw className={`h-3 w-3 text-brand-400 ${isReplaying ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">{isReplaying ? 'กำลังส่ง...' : 'เล่นซ้ำบน OBS'}</span>
                              </button>

                              <button
                                onClick={() => handleDelete(d.id)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                title="ลบรายการนี้"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Slip Image Viewer Modal */}
      {selectedSlipImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-sm w-full rounded-2xl bg-[#111622] border border-white/10 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">หลักฐานสลิปโอนเงิน</h3>
              </div>
              <button
                onClick={() => setSelectedSlipImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 bg-black flex justify-center p-2">
              <img src={selectedSlipImage} alt="Slip Proof" className="max-h-96 w-auto object-contain rounded-lg" />
            </div>

            <button
              onClick={() => setSelectedSlipImage(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
