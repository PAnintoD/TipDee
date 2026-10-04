'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  ReceiptText, Search, Download, RotateCcw, Trash2,
  CheckCircle2, Clock, QrCode, Receipt, Eye, X,
  ChevronLeft, ChevronRight, TrendingUp, Users,
  Banknote, Calendar, Filter, RefreshCw, Loader2,
  CheckCheck, XCircle,
} from 'lucide-react';

const LIMIT = 20;

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="surface-card p-4 flex items-center gap-3.5">
      <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-300">
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-lg font-bold text-white font-mono tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function DonationsPage() {
  const { data: session } = useSession();
  const streamerId = (session?.user as any)?.streamerId ?? 'streamerza';

  const [donations, setDonations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Actions
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [selectedSlipImage, setSelectedSlipImage] = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams({ streamerId, page: String(page), limit: String(LIMIT) });
    if (search) params.set('search', search);
    if (methodFilter) params.set('paymentMethod', methodFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    return `/api/donations?${params}`;
  }, [streamerId, page, search, methodFilter, statusFilter, dateFrom, dateTo]);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(buildQuery());
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
        setTotal(data.total ?? data.data.length);
        setTotalPages(data.totalPages ?? 1);
        setTotalAmount(data.totalAmount ?? 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, methodFilter, statusFilter, dateFrom, dateTo]);

  const handleReplay = async (id: string) => {
    setReplayingId(id);
    await fetch('/api/donations/replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donationId: id, streamerId }),
    });
    setTimeout(() => setReplayingId(null), 1200);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ลบรายการโดเนทนี้ใช่หรือไม่?')) return;
    setDeletingId(id);
    const res = await fetch(`/api/donations/${id}`, { method: 'DELETE' });
    if (res.ok) setDonations((p) => p.filter((d) => d.id !== id));
    setDeletingId(null);
  };

  const handleConfirm = async (id: string) => {
    setConfirmingId(id);
    const res = await fetch(`/api/donations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    if (res.ok) {
      setDonations((p) => p.map((d) => d.id === id ? { ...d, status: 'completed' } : d));
    }
    setConfirmingId(null);
  };

  const handleExportCSV = () => {
    if (donations.length === 0) return;
    const headers = ['วันที่', 'เวลา', 'ชื่อผู้บริจาค', 'จำนวนเงิน(บาท)', 'ข้อความ', 'ช่องทาง', 'สถานะ', 'รหัสสลิป'];
    const rows = donations.map((d) => {
      const dt = new Date(d.createdAt);
      return [
        `"${dt.toLocaleDateString('th-TH')}"`,
        `"${dt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}"`,
        `"${(d.donorName || '').replace(/"/g, '""')}"`,
        d.amount,
        `"${(d.message || '').replace(/"/g, '""')}"`,
        `"${d.paymentMethod}"`,
        `"${d.status}"`,
        `"${d.slipRef || ''}"`,
      ].join(',');
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url; a.download = `tipdee_donations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const formatDate = (d: Date) => `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
  const formatTime = (d: Date) => d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

  const methodBadge: Record<string, JSX.Element> = {
    slip: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium"><Receipt className="h-3 w-3" /> สลิป</span>,
    promptpay: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-medium"><QrCode className="h-3 w-3" /> PromptPay</span>,
    truemoney: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium">🎁 TrueMoney</span>,
    test: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-medium">⚡ ทดสอบ</span>,
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col font-sans">
      <Navbar streamerId={streamerId} />
      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                <ReceiptText className="h-6 w-6 text-emerald-400" /> ประวัติรายการโดเนท
              </h1>
              <p className="text-xs text-slate-400 mt-1">ค้นหา กรอง และส่งสัญญาณแจ้งเตือนย้อนหลังไปยัง OBS</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchDonations} 
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button 
                onClick={handleExportCSV} 
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold border border-white/[0.08] hover:border-white/[0.15] transition-colors"
              >
                <Download className="h-4 w-4 text-emerald-400" /> ส่งออก CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon={Banknote} label="ยอดรวม (ที่กรอง)" value={`${totalAmount.toLocaleString('th-TH')} ฿`} color="text-emerald-400" />
            <StatCard icon={ReceiptText} label="จำนวนรายการ" value={`${total.toLocaleString()} รายการ`} color="text-blue-400" />
            <StatCard icon={CheckCircle2} label="สำเร็จแล้ว" value={`${donations.filter(d => d.status === 'completed').length} / ${donations.length}`} color="text-emerald-400" />
            <StatCard icon={Clock} label="รอยืนยันสลิป" value={`${donations.filter(d => d.status === 'pending').length} รายการ`} color="text-amber-400" />
          </div>

          {/* Filter Bar */}
          <div className="surface-card p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อผู้บริจาค หรือข้อความ..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
              </div>
              {/* Method */}
              <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0e121a] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors">
                <option value="">ช่องทางทั้งหมด</option>
                <option value="promptpay">PromptPay</option>
                <option value="slip">สลิปธนาคาร</option>
                <option value="truemoney">TrueMoney</option>
                <option value="test">ทดสอบ</option>
              </select>
              {/* Status */}
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0e121a] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors">
                <option value="">สถานะทั้งหมด</option>
                <option value="completed">สำเร็จ</option>
                <option value="pending">รอดำเนินการ</option>
              </select>
            </div>
            {/* Date Range */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.04]">
              <Calendar className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
              <span className="text-xs text-slate-400">ช่วงวันที่:</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors" />
              <span className="text-slate-500 text-xs">ถึง</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors" />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs flex items-center gap-1 transition-colors">
                  <X className="h-3 w-3" /> ล้างวันที่
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="surface-card overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
                <p className="text-xs text-slate-500">กำลังโหลดรายการโดเนท...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/[0.06]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">วันที่/เวลา</th>
                      <th className="px-4 py-3 font-semibold">ผู้บริจาค</th>
                      <th className="px-4 py-3 font-semibold">จำนวนเงิน</th>
                      <th className="px-4 py-3 font-semibold">ข้อความ</th>
                      <th className="px-4 py-3 font-semibold">ช่องทาง</th>
                      <th className="px-4 py-3 font-semibold">สถานะ</th>
                      <th className="px-4 py-3 font-semibold text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                          <ReceiptText className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                          <p className="font-medium text-slate-400">ไม่พบรายการโดเนท</p>
                          <p className="text-xs text-slate-600 mt-1">ลองเปลี่ยนตัวกรอง หรือค้นหาใหม่อีกครั้ง</p>
                        </td>
                      </tr>
                    ) : donations.map((d) => {
                      const dt = new Date(d.createdAt);
                      const isReplaying = replayingId === d.id;
                      const isDeleting = deletingId === d.id;
                      const isConfirming = confirmingId === d.id;
                      return (
                        <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-slate-200">{formatDate(dt)}</div>
                            <div className="text-slate-500 text-[11px] font-mono">{formatTime(dt)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-[10px]">
                                {d.donorName.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-white">{d.donorName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-bold text-emerald-400 font-mono tracking-tight">+{d.amount.toLocaleString('th-TH')} ฿</span>
                          </td>
                          <td className="px-4 py-3 max-w-[220px]">
                            <p className="truncate text-slate-300" title={d.message}>
                              {d.message || <span className="text-slate-600 italic">ไม่มีข้อความ</span>}
                            </p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {methodBadge[d.paymentMethod] ?? <span className="text-slate-500">{d.paymentMethod}</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {d.status === 'completed'
                                ? <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> สำเร็จ</span>
                                : <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-xs"><Clock className="h-3.5 w-3.5" /> รอยืนยัน</span>
                              }
                              {d.slipImage && (
                                <button onClick={() => setSelectedSlipImage(d.slipImage)}
                                  className="p-1 rounded-md bg-white/[0.04] hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors" title="ดูภาพสลิป">
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Confirm pending */}
                              {d.status === 'pending' && (
                                <button onClick={() => handleConfirm(d.id)} disabled={isConfirming}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[11px] font-medium transition-colors disabled:opacity-50"
                                  title="ยืนยันการโดเนท">
                                  {isConfirming ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                                  <span className="hidden sm:inline">ยืนยัน</span>
                                </button>
                              )}
                              {/* Replay */}
                              <button onClick={() => handleReplay(d.id)} disabled={isReplaying}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-[11px] font-medium border border-white/[0.08] transition-colors disabled:opacity-50"
                                title="ส่งสัญญาณแจ้งเตือนซ้ำไปยัง OBS">
                                <RotateCcw className={`h-3 w-3 text-emerald-400 ${isReplaying ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">{isReplaying ? 'ส่งสัญญาณ...' : 'OBS'}</span>
                              </button>
                              {/* Delete */}
                              <button onClick={() => handleDelete(d.id)} disabled={isDeleting}
                                className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="ลบรายการ">
                                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                หน้า {page} จาก {totalPages} (รวม {total} รายการ)
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${p === page ? 'bg-emerald-500 text-slate-950' : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.08]'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slip Image Modal */}
      {selectedSlipImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative max-w-sm w-full rounded-2xl bg-[#0c1017] border border-white/[0.1] p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">หลักฐานสลิปโอนเงิน</h3>
              </div>
              <button onClick={() => setSelectedSlipImage(null)} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black/60 flex justify-center p-2">
              <img src={selectedSlipImage} alt="Slip" className="max-h-96 w-auto object-contain rounded-lg" />
            </div>
            <button onClick={() => setSelectedSlipImage(null)}
              className="w-full mt-4 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium transition-colors">
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
