import { NextRequest } from 'next/server';
import { donationEmitter, DonationAlertEvent } from '@/lib/events';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { streamerId: string } }
) {
  const paramId = params.streamerId || 'streamerza';

  // Lookup streamer to get both id and username
  let streamerId = paramId;
  let username = paramId;

  try {
    const streamer = await prisma.streamer.findFirst({
      where: {
        OR: [{ id: paramId }, { username: paramId }],
      },
      select: { id: true, username: true },
    });
    if (streamer) {
      streamerId = streamer.id;
      username = streamer.username;
    }
  } catch (err) {
    console.warn('[SSE] Streamer lookup error:', err);
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let isClosed = false;
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let lifecycleTimer: NodeJS.Timeout | null = null;

  const cleanup = () => {
    if (isClosed) return;
    isClosed = true;

    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (lifecycleTimer) clearTimeout(lifecycleTimer);

    donationEmitter.off(`streamer:${streamerId}`, listener);
    if (username !== streamerId) {
      donationEmitter.off(`streamer:${username}`, listener);
    }

    try {
      writer.close();
    } catch {
      // Stream may already be closed
    }
  };

  // Safe write helper
  const safeWrite = async (chunk: string) => {
    if (isClosed) return false;
    try {
      await writer.write(encoder.encode(chunk));
      return true;
    } catch {
      cleanup();
      return false;
    }
  };

  // Event listener for this specific streamer
  const listener = (event: DonationAlertEvent) => {
    safeWrite(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Register listeners on both ID and username
  donationEmitter.on(`streamer:${streamerId}`, listener);
  if (username !== streamerId) {
    donationEmitter.on(`streamer:${username}`, listener);
  }

  // Send initial connection payload with retry configuration (1000ms reconnect)
  await safeWrite(`retry: 1000\ndata: ${JSON.stringify({
    type: 'connected',
    streamerId,
    username,
    timestamp: new Date().toISOString(),
  })}\n\n`);

  // Keep-alive heartbeat every 15s to keep connections alive through proxies/OBS
  heartbeatTimer = setInterval(() => {
    safeWrite(': ping\n\n');
  }, 15000);

  // Maximum stream duration (50s) to gracefully recycle connection on serverless/edge runtimes
  // before hard timeouts occur, allowing EventSource to reconnect seamlessly.
  lifecycleTimer = setTimeout(() => {
    safeWrite('event: reconnect\ndata: {}\n\n').then(() => cleanup());
  }, 50000);

  // Connection close event from client
  request.signal.addEventListener('abort', cleanup);

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Content-Encoding': 'none',
    },
  });
}
