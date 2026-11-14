import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { questathonGet } from "@/lib/questathon";
import { reserveCall } from "@/lib/rate-limit";
export const runtime = "nodejs";

export async function POST() {
  try {
    const store = await readStore();
    const reservation = await reserveCall(store, "signals");
    if (!reservation.ok) return NextResponse.json({ ok: true, skipped: true, waitSeconds: reservation.waitSeconds });
    const data = await questathonGet("/signals");
    const incoming = Array.isArray(data) ? data : (data?.signals ?? data?.events ?? [data]);
    const prior = new Set(store.signals.map((x: any) => x?.id ?? x?.signal_id ?? JSON.stringify(x)));
    const previousCount = store.signals.length;
    const merged = [...store.signals];
    for (const item of incoming) {
      const key = (item as any)?.id ?? (item as any)?.signal_id ?? JSON.stringify(item);
      if (!prior.has(key)) { merged.push(item); prior.add(key); }
    }
    store.signals = merged;
    store.fetchedAt.signals = new Date().toISOString();
    await writeStore(store);
    return NextResponse.json({ ok: true, newCount: merged.length - previousCount, fetchedAt: store.fetchedAt.signals });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Signal poll failed" }, { status: 500 });
  }
}
