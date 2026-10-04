'use client';

import React, { useState } from 'react';
import { Bell, Sparkles, X, Volume2, Send, CheckCircle2, Play } from 'lucide-react';
import { playAlertSound, SOUND_PRESETS } from '@/lib/soundEffects';
import { speakText } from '@/lib/ttsEngine';

interface TestAlertModalProps {
  streamerId?: string;
  onClose: () => void;
}

export function TestAlertModal({ streamerId = 'streamerza', onClose }: TestAlertModalProps) {
  const [donorName, setDonorName] = useState('Tester Gamer 🚀');
  const [amount, setAmount] = useState('100');
  const [message, setMessage] = useState('ทดสอบระบบแจ้งเตือน TipDee โดเนทสำเร็จ เสียง TTS และภาพแสดงผลปกติ!');
  const [enableTTS, setEnableTTS] = useState(true);
  const [selectedSound, setSelectedSound] = useState('levelup');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTestAudioLocal = async () => {
    await playAlertSound(selectedSound, 80);
    if (enableTTS) {
      setTimeout(() => {
        speakText(`${donorName} โดเนท ${amount} บาท ข้อความ: ${message}`);
      }, 500);
    }
  };

  const handleSendToOBS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setIsSuccess(false);

    try {
      const res = await fetch('/api/donations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId,
          donorName,
          amount: Number(amount) || 100,
          message,
          enableTTS,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        // Also play locally if previewing in dashboard
        handleTestAudioLocal();
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to trigger test alert', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-[#0e121a] border border-white/[0.08] p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">ทดสอบการแจ้งเตือน (Test Alert)</h3>
              <p className="text-xs text-slate-400">ยิงสัญญาณแจ้งเตือนจำลองไปยัง OBS Browser Source ทันที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSendToOBS} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">ชื่อผู้บริจาค (Donor Name)</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="เช่น นายใจดี สายเปย์"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">จำนวนเงิน (บาท)</label>
              <div className="flex items-center gap-1">
                {[
                  { amt: '20', name: 'แฟนคลับตัวน้อย', label: '20฿' },
                  { amt: '100', name: 'ผู้สนับสนุนใจดี', label: '100฿' },
                  { amt: '500', name: 'เสี่ยสั่งลุย', label: '500฿' },
                  { amt: '1000', name: 'สุลต่านแห่งเมืองไทย', label: '1,000฿' },
                ].map((preset) => (
                  <button
                    key={preset.amt}
                    type="button"
                    onClick={() => { setAmount(preset.amt); setDonorName(preset.name); }}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      amount === preset.amt
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="100"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">ข้อความโดเนท (Donation Message)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="พิมพ์ข้อความที่ต้องการทดสอบ..."
            />
          </div>

          {/* Sound & TTS Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">เสียงแจ้งเตือน (Sound Effect)</label>
              <select
                value={selectedSound}
                onChange={(e) => setSelectedSound(e.target.value)}
                className="w-full rounded-lg bg-[#141822] border border-white/[0.08] px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {SOUND_PRESETS.map((snd) => (
                  <option key={snd.id} value={snd.id}>
                    {snd.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] cursor-pointer hover:bg-white/[0.06] transition-colors">
                <input
                  type="checkbox"
                  checked={enableTTS}
                  onChange={(e) => setEnableTTS(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 h-4 w-4 bg-slate-800 border-slate-700"
                />
                <span className="text-xs font-medium text-slate-200">เปิดอ่านออกเสียง (TTS)</span>
              </label>
            </div>
          </div>

          {/* Status Message */}
          {isSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-alert-pop">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>ส่งแจ้งเตือนไปยัง OBS และส่งสัญญาณเสียงเรียบร้อยแล้ว</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={handleTestAudioLocal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-medium border border-white/[0.08] transition-colors"
            >
              <Play className="h-3.5 w-3.5 text-emerald-400" />
              <span>ฟังเสียงตัวอย่าง</span>
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSending ? 'กำลังส่งสัญญาณ...' : 'ยิงแจ้งเตือนเข้า OBS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
