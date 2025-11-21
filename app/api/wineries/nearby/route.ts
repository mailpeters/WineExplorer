import { NextResponse } from 'next/server';
import { getNearbyWineries } from '@/lib/wineries-data';

function toNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = toNumber(searchParams.get('lat'));
  const lng = toNumber(searchParams.get('lng'));
  const radiusMiles = toNumber(searchParams.get('radius')) ?? undefined;
  const limit = toNumber(searchParams.get('limit')) ?? undefined;

  if (lat === null || lng === null) {
    return NextResponse.json(
      { error: 'lat and lng query parameters are required numbers' },
      { status: 400 }
    );
  }

  const nearby = getNearbyWineries({ lat, lng, radiusMiles, limit });

  return NextResponse.json({
    origin: { lat, lng },
    radiusMiles: radiusMiles ?? 25,
    results: nearby,
  });
}
