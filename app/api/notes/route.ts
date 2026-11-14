import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { questathonPost } from "@/lib/questathon";
import { reserveCall } from "@/lib/rate-limit";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (!payload?.text?.trim() || !["A", "B"].includes(payload?.account)) {
      return NextResponse.json({ error: "A valid account (A/B) and non-empty text are required." }, { status: 400 });
    }
    const store = await readStore();
    const reservation = await reserveCall(store, "write_note");
    if (!reservation.ok) {
      return NextResponse.json({
        error: "Rate limit guard: wait before the next API call.",
        waitSeconds: reservation.waitSeconds
      }, { status: 429 });
    }
    const result = await questathonPost("/notes", payload);
    store.notes = [...store.notes, { ...payload, result, savedAt: new Date().toISOString() }];
    await writeStore(store);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
