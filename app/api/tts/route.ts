import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!text || !text.trim()) {
      return new NextResponse('Missing text parameter', { status: 400 });
    }

    // Clean and limit text length
    const cleanText = text.trim().slice(0, 200);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=th&client=tw-ob`;

    const res = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!res.ok) {
      console.warn('[TTS API] Google TTS upstream error:', res.status);
      return new NextResponse('TTS service error', { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('[TTS API] Error generating speech:', error);
    return new NextResponse('Failed to generate speech', { status: 500 });
  }
}
