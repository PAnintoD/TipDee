'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import {
  UserCircle,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { YouTubeIcon, TwitchIcon, FacebookIcon } from '@/components/SocialIcons';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();
  const streamerId = (session?.user as any)?.username || (session?.user as any)?.streamerId || 'streamerza';
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    bannerUrl: '',
    socialLinks: {
      youtube: '',
      twitch: '',
      facebook: '',
      discord: '',
      tiktok: '',
    },
  });

  useEffect(() => {
    fetch(`/api/streamer?id=${streamerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProfile({
            displayName: data.data.displayName || '',
            bio: data.data.bio || '',
            avatarUrl: data.data.avatarUrl || '',
            bannerUrl: data.data.bannerUrl || '',
            socialLinks: {
              youtube: data.data.socialLinks?.youtube || '',
              twitch: data.data.socialLinks?.twitch || '',
              facebook: data.data.socialLinks?.facebook || '',
              discord: data.data.socialLinks?.discord || '',
              tiktok: data.data.socialLinks?.tiktok || '',
            },
          });
        }
      })
      .finally(() => setLoading(false));
  }, [streamerId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/streamer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: streamerId,
          ...profile,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <Navbar streamerId={streamerId} />

      <div className="flex flex-1">
        <Sidebar streamerId={streamerId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                <UserCircle className="h-6 w-6 text-brand-400" />
                <span>ปรับแต่งหน้าโดเนทของฉัน (Public Profile)</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                จัดการชื่อช่อง รูปโปรไฟล์ ภาพปกหลัง และลิงก์โซเชียลมีเดียที่แสดงต่อผู้ชม
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/u/${streamerId}`}
                target="_blank"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 transition-all"
              >
                <span>ดูหน้าจริง</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {saveSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{isSaving ? 'กำลังบันทึก...' : saveSuccess ? 'บันทึกเรียบร้อย!' : 'บันทึกข้อมูล'}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Live Visual Preview Header */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900">
              <div
                className="h-36 sm:h-44 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${profile.bannerUrl})` }}
              >
                <div className="h-full w-full bg-gradient-to-t from-[#0e1219] via-transparent to-black/30" />
              </div>

              <div className="p-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-14">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="h-24 w-24 rounded-2xl object-cover border-4 border-[#0e1219] shadow-xl ring-2 ring-brand-500/40"
                />
                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-xl font-bold text-white">{profile.displayName}</h3>
                  <p className="text-xs text-brand-400 font-mono">tipdee.vercel.app/u/{streamerId}</p>
                </div>
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0e1219]/90 space-y-4">
              <h3 className="text-base font-bold text-white">ข้อมูลช่องและภาพประกอบ</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">ชื่อช่อง / ชื่อแสดง (Display Name):</label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">ข้อความแนะนำ / คำอธิบายช่อง (Bio):</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">ลิงก์รูปโปรไฟล์ Avatar URL:</label>
                    <input
                      type="text"
                      value={profile.avatarUrl}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">ลิงก์ภาพปกหลัง Banner URL:</label>
                    <input
                      type="text"
                      value={profile.bannerUrl}
                      onChange={(e) => setProfile({ ...profile, bannerUrl: e.target.value })}
                      className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0e1219]/90 space-y-4">
              <h3 className="text-base font-bold text-white">ลิงก์โซเชียลมีเดีย (Social Links)</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <YouTubeIcon className="h-3.5 w-3.5 text-red-500" /> YouTube:
                  </label>
                  <input
                    type="text"
                    value={profile.socialLinks.youtube}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, youtube: e.target.value } })}
                    placeholder="https://youtube.com/..."
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <TwitchIcon className="h-3.5 w-3.5 text-purple-400" /> Twitch:
                  </label>
                  <input
                    type="text"
                    value={profile.socialLinks.twitch}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, twitch: e.target.value } })}
                    placeholder="https://twitch.tv/..."
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <FacebookIcon className="h-3.5 w-3.5 text-blue-500" /> Facebook:
                  </label>
                  <input
                    type="text"
                    value={profile.socialLinks.facebook}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, facebook: e.target.value } })}
                    placeholder="https://facebook.com/..."
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-400" /> Discord:
                  </label>
                  <input
                    type="text"
                    value={profile.socialLinks.discord}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, discord: e.target.value } })}
                    placeholder="https://discord.gg/..."
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
