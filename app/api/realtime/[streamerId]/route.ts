import { NextRequest } from 'next/server';
import { donationEmitter, DonationAlertEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { streamerId: string } }
) {
  const streamerId = params.streamerId || 'streamerza';

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection event
  const initialPayload = `data: ${JSON.stringify({ type: 'connected', streamerId, timestamp: new Date().toISOString() })}\n\n`;
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

  donationEmitter.on(`streamer:${streamerId}`, listener);

  // Keep-alive heartbeat every 15s
  const intervalId = setInterval(() => {
    try {
      writer.write(encoder.encode(': ping\n\n'));
    } catch (e) {
      clearInterval(intervalId);
    }
  }, 15000);

  // Cleanup on abort
  request.signal.addEventListener('abort', () => {
    clearInterval(intervalId);
    donationEmitter.off(`streamer:${streamerId}`, listener);
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
