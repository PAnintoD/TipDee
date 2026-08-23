'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  Code2,
  Key,
  Copy,
  Check,
  Globe,
  Terminal,
  Send,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function DeveloperPage() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || 'streamerza';

  const [apiKey, setApiKey] = useState('tipdee_live_sk_948f2910a8b730f1e');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const sampleCurl = `curl -X POST https://tipdee.app/api/donations \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "streamerId": "${username}",
    "donorName": "ผู้สนับสนุนใจดี",
    "amount": 100,
    "message": "ส่งกำลังใจให้สตรีมเมอร์ครับ!",
    "enableTTS": true
  }'`;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={username} />

      <div className="flex flex-1">
        <Sidebar streamerId={username} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Code2 className="h-6 w-6 text-brand-400" />
              <span>โซนผู้พัฒนา (Developer API & Webhooks)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              เชื่อมต่อ TipDee เข้ากับระบบภายนอกของคุณ เช่น บอท Discord, เซิร์ฟเวอร์ FiveM, Minecraft, หรือเว็บไซต์ส่วนตัว
            </p>
          </div>

          {/* API Key Box */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Live Secret API Key</h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold">Active</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="password"
                value={apiKey}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs text-white"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-bold transition-all shadow-md"
                >
                  {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedKey ? 'คัดลอกแล้ว' : 'คัดลอก Key'}</span>
                </button>

                <button
                  onClick={() => {
                    const newKey = `tipdee_live_sk_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
                    setApiKey(newKey);
                    alert('สร้าง API Key ใหม่เรียบร้อยแล้ว');
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="สร้าง Key ใหม่ (Regenerate)"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">⚠️ เก็บ API Key ไว้เป็นความลับ ห้ามเปิดเผยในที่สาธารณะ</p>
          </div>

          {/* Quick API Docs */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">ตัวอย่างการเรียกใช้งาน API (cURL Example)</h3>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sampleCurl);
                  setCopiedCurl(true);
                  setTimeout(() => setCopiedCurl(false), 2000);
                }}
                className="text-xs text-brand-400 font-bold hover:underline flex items-center gap-1"
              >
                {copiedCurl ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-black/80 border border-white/10 overflow-x-auto">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre">
                {sampleCurl}
              </pre>
            </div>
          </div>

          {/* Webhook Events Reference */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0e1219]/90 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Globe className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">รายการ Webhook Events ที่ระบบรองรับ</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-brand-400">donation.completed</span>
                <p className="text-xs text-slate-300">ส่งข้อมูลเมื่อมีผู้บริจาคเงินสำเร็จ (ผ่านสลิป, QR Code, หรือ TrueMoney)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-blue-400">member.subscribed</span>
                <p className="text-xs text-slate-300">ส่งข้อมูลเมื่อมีแฟนคลับสมัครสมาชิกรายเดือนใหม่ (Fan Tier)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-purple-400">goal.reached</span>
                <p className="text-xs text-slate-300">ส่งข้อมูลเมื่อแถบเป้าหมายการระดมทุนบรรลุครบ 100%</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                <span className="text-xs font-mono font-bold text-amber-400">alert.triggered</span>
                <p className="text-xs text-slate-300">ส่งข้อมูลเมื่อมีการเด้งแจ้งเตือนบนจอ OBS Studio พร้อมเสียงอ่าน TTS</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
