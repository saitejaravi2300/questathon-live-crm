import { readStore, writeStore, type Store } from "@/lib/store";

export function cooldownRemaining(store: Store) {
  if (!store.lastCallAt) return 0;
  return Math.max(0, 60_000 - (Date.now() - new Date(store.lastCallAt).getTime()));
}

export async function reserveCall(store: Store, resource: string) {
  const remaining = cooldownRemaining(store);
  if (remaining > 0) return { ok: false as const, waitSeconds: Math.ceil(remaining / 1000) };
  // Persist the reservation before the outbound request so overlapping requests
  // from multiple browser tabs cannot intentionally bypass the one-call/minute guard.
  store.lastCallAt = new Date().toISOString();
  store.lastCallResource = resource;
  await writeStore(store);
  return { ok: true as const };
}
