import { NextResponse } from "next/server";
import { searchWineries } from "@/lib/wineries-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (q.trim().length === 0) {
    return NextResponse.json({ wineries: [] });
  }

  const results = searchWineries(q);
  return NextResponse.json({ wineries: results });
}
