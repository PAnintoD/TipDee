import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function splitTextIntoChunks(text: string, maxLen = 160): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let sliceIdx = remaining.lastIndexOf(' ', maxLen);
    if (sliceIdx <= 0) sliceIdx = remaining.lastIndexOf('!', maxLen);
    if (sliceIdx <= 0) sliceIdx = remaining.lastIndexOf('?', maxLen);
    if (sliceIdx <= 0) sliceIdx = maxLen;

    chunks.push(remaining.slice(0, sliceIdx).trim());
    remaining = remaining.slice(sliceIdx).trim();
  }
  return chunks.filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!text || !text.trim()) {
      return new NextResponse('Missing text parameter', { status: 400 });
    }

    const cleanText = text.trim().slice(0, 250);
    const chunks = splitTextIntoChunks(cleanText);

    // Fetch MP3 chunks from Google Translate TTS (The iconic streamer Siri Thai voice)
    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=th&client=tw-ob`;

      const res = await fetch(googleTtsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
      });

      if (!res.ok) {
        console.warn('[TTS API] Google TTS upstream response:', res.status);
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      audioBuffers.push(buf);
    }

    if (audioBuffers.length === 0) {
      return new NextResponse('Failed to generate speech', { status: 502 });
    }

    const combinedAudio = Buffer.concat(audioBuffers);

    return new NextResponse(combinedAudio, {
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
