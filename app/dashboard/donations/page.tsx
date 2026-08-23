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
    <div className="bg-slate-900 border border-white/10 rounded-xl p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-slate-800`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
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
    slip: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold"><Receipt className="h-3 w-3" /> สลิป</span>,
    promptpay: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-bold"><QrCode className="h-3 w-3" /> PromptPay</span>,
    truemoney: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold">🎁 TrueMoney</span>,
    test: <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[11px] font-bold">⚡ ทดสอบ</span>,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <ReceiptText className="h-6 w-6 text-brand-400" /> ประวัติรายการโดเนท
              </h1>
              <p className="text-xs text-slate-400 mt-1">ค้นหา กรอง และจัดการประวัติโดเนททั้งหมด</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchDonations} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-white/10 transition-colors">
                <Download className="h-4 w-4 text-brand-400" /> Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Banknote} label="ยอดรวม (กรอง)" value={`${totalAmount.toLocaleString('th-TH')} ฿`} color="text-brand-400" />
            <StatCard icon={ReceiptText} label="จำนวนรายการ" value={`${total.toLocaleString()} รายการ`} color="text-blue-400" />
            <StatCard icon={CheckCircle2} label="สำเร็จ" value={`${donations.filter(d => d.status === 'completed').length} / ${donations.length}`} color="text-emerald-400" />
            <StatCard icon={Clock} label="รอยืนยัน" value={`${donations.filter(d => d.status === 'pending').length} รายการ`} color="text-amber-400" />
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อผู้บริจาค, ข้อความ..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              {/* Method */}
              <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors">
                <option value="">ช่องทางทั้งหมด</option>
                <option value="promptpay">PromptPay</option>
                <option value="slip">สลิปธนาคาร</option>
                <option value="truemoney">TrueMoney</option>
                <option value="test">ทดสอบ</option>
              </select>
              {/* Status */}
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors">
                <option value="">สถานะทั้งหมด</option>
                <option value="completed">สำเร็จ</option>
                <option value="pending">รอดำเนินการ</option>
              </select>
            </div>
            {/* Date Range */}
            <div className="flex flex-wrap items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
              <span className="text-slate-500 text-sm">ถึง</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-xs text-red-400 hover:text-red-300">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 text-brand-400 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3 font-bold">วันที่/เวลา</th>
                      <th className="px-4 py-3 font-bold">ผู้บริจาค</th>
                      <th className="px-4 py-3 font-bold">จำนวนเงิน</th>
                      <th className="px-4 py-3 font-bold">ข้อความ</th>
                      <th className="px-4 py-3 font-bold">ช่องทาง</th>
                      <th className="px-4 py-3 font-bold">สถานะ</th>
                      <th className="px-4 py-3 font-bold text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                          ไม่พบรายการโดเนท
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
                            <div className="font-semibold text-slate-200">{formatDate(dt)}</div>
                            <div className="text-slate-500 text-[11px]">{formatTime(dt)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
                                {d.donorName.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-white">{d.donorName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-black text-brand-400">+{d.amount.toLocaleString('th-TH')} ฿</span>
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
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
                                ? <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> สำเร็จ</span>
                                : <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-xs"><Clock className="h-3.5 w-3.5" /> รอยืนยัน</span>
                              }
                              {d.slipImage && (
                                <button onClick={() => setSelectedSlipImage(d.slipImage)}
                                  className="p-1 rounded-md bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors" title="ดูสลิป">
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
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-semibold transition-colors disabled:opacity-50"
                                  title="ยืนยันการโดเนท">
                                  {isConfirming ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                                  <span className="hidden sm:inline">ยืนยัน</span>
                                </button>
                              )}
                              {/* Replay */}
                              <button onClick={() => handleReplay(d.id)} disabled={isReplaying}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors disabled:opacity-50"
                                title="เล่นแจ้งเตือนซ้ำบน OBS">
                                <RotateCcw className={`h-3 w-3 text-brand-400 ${isReplaying ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">{isReplaying ? '...' : 'OBS'}</span>
                              </button>
                              {/* Delete */}
                              <button onClick={() => handleDelete(d.id)} disabled={isDeleting}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                                title="ลบ">
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
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                หน้า {page} จาก {totalPages} (รวม {total} รายการ)
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === page ? 'bg-brand-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slip Image Modal */}
      {selectedSlipImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-sm w-full rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">หลักฐานสลิปโอนเงิน</h3>
              </div>
              <button onClick={() => setSelectedSlipImage(null)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black flex justify-center p-2">
              <img src={selectedSlipImage} alt="Slip" className="max-h-96 w-auto object-contain rounded-lg" />
            </div>
            <button onClick={() => setSelectedSlipImage(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors">
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
