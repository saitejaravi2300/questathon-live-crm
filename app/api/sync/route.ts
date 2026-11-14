import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { questathonGet } from "@/lib/questathon";
import { reserveCall } from "@/lib/rate-limit";
export const runtime = "nodejs";

const paths: Record<string, string> = {
  me: "/me",
  export: "/export",
  schema: "/schema",
  accountA: "/pack/A/all",
  accountB: "/pack/B/all",
  signals: "/signals",
  notes: "/notes"
};

export async function POST(req: NextRequest) {
  try {
    const { resource } = await req.json();
    const path = paths[String(resource)];
    if (!path) return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
    const store = await readStore();
    const reservation = await reserveCall(store, String(resource));
    if (!reservation.ok) {
      return NextResponse.json({
        error: "Rate limit guard: wait before the next API call.",
        waitSeconds: reservation.waitSeconds
      }, { status: 429 });
    }
    const data = await questathonGet(path);
    if (resource === "signals") {
      store.signals = Array.isArray(data) ? data : (data?.signals ?? data?.events ?? [data]);
    } else if (resource === "notes") {
      store.notes = Array.isArray(data) ? data : (data?.notes ?? [data]);
    } else {
      store.resources[String(resource)] = data;
    }
    store.fetchedAt[String(resource)] = new Date().toISOString();
    await writeStore(store);
    return NextResponse.json({ ok: true, resource, fetchedAt: store.fetchedAt[String(resource)], data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
