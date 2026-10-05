import React from 'react';

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full !bg-transparent overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body, #__next, body > div:first-child {
              background: transparent !important;
              background-color: transparent !important;
              overflow: hidden !important;
            }
          `,
        }}
      />
      {children}
    </div>
  );
}
