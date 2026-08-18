import { NextRequest, NextResponse } from 'next/server';
import { getStreamer, updateStreamer, getDonationStats } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamerId = searchParams.get('id') || 'streamerza';
    const streamer = await getStreamer(streamerId);
    const stats = await getDonationStats(streamerId);

    return NextResponse.json({
      success: true,
      data: {
        ...streamer,
        stats,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch streamer data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const streamerId = body.id || 'streamerza';
    
    const updated = await updateStreamer(streamerId, body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update streamer data' },
      { status: 500 }
    );
  }
}
