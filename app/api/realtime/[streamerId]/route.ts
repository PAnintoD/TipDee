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
    });
    if (streamer) {
      streamerId = streamer.id;
      username = streamer.username;
    }
  } catch {}

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection event
  const initialPayload = `data: ${JSON.stringify({
    type: 'connected',
    streamerId,
    username,
    timestamp: new Date().toISOString(),
  })}\n\n`;
  writer.write(encoder.encode(initialPayload));

  // Event listener for this specific streamer
  const listener = (event: DonationAlertEvent) => {
    try {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      writer.write(encoder.encode(data));
    } catch (e) {
      console.error('Error writing to SSE stream', e);
    }
  };

  // Register listeners on both ID and username
  donationEmitter.on(`streamer:${streamerId}`, listener);
  if (username !== streamerId) {
    donationEmitter.on(`streamer:${username}`, listener);
  }

  // Keep-alive heartbeat every 15s to prevent connection dropouts on OBS / Nginx / Proxies
  const intervalId = setInterval(() => {
    try {
      writer.write(encoder.encode(': ping\n\n'));
    } catch (e) {
      clearInterval(intervalId);
    }
  }, 15000);

  // Cleanup on connection close
  request.signal.addEventListener('abort', () => {
    clearInterval(intervalId);
    donationEmitter.off(`streamer:${streamerId}`, listener);
    if (username !== streamerId) {
      donationEmitter.off(`streamer:${username}`, listener);
    }
    try {
      writer.close();
    } catch (e) {
      // already closed
    }
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
