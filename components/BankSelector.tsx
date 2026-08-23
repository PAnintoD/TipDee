'use client';

import React from 'react';

const BANKS = [
  { value: 'SCB', label: 'SCB ธนาคารไทยพาณิชย์', color: '#4e2d8c' },
  { value: 'KBANK', label: 'KBANK กสิกรไทย', color: '#1e7e34' },
  { value: 'KTB', label: 'KTB กรุงไทย', color: '#1565c0' },
  { value: 'BBL', label: 'BBL กรุงเทพ', color: '#1a237e' },
  { value: 'BAY', label: 'BAY กรุงศรี', color: '#e65100' },
  { value: 'TTB', label: 'TTB ทหารไทยธนชาต', color: '#0288d1' },
  { value: 'GSB', label: 'GSB ออมสิน', color: '#e91e63' },
  { value: 'BAAC', label: 'BAAC ธ.ก.ส.', color: '#2e7d32' },
  { value: 'PROMPTPAY', label: 'พร้อมเพย์ (ทุกธนาคาร)', color: '#1b5e20' },
];

interface BankSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function BankSelector({ value, onChange, label = 'ธนาคาร' }: BankSelectorProps) {
  const selected = BANKS.find((b) => b.value === value);

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <div className="relative">
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: selected?.color ?? '#64748b' }}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-800 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors appearance-none"
        >
          <option value="">-- เลือกธนาคาร --</option>
          {BANKS.map((bank) => (
            <option key={bank.value} value={bank.value}>
              {bank.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
