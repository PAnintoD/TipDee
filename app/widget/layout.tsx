import React from 'react';

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-transparent overflow-hidden">
      <style>{`
        html, body {
          background: transparent !important;
          background-color: transparent !important;
          overflow: hidden !important;
        }
      `}</style>
      {children}
    </div>
  );
}
