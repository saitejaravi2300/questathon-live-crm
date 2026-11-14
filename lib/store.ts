import fs from "node:fs/promises";
import path from "node:path";

const dir = process.env.DATA_DIR || "./data";
const file = path.join(dir, "crm-store.json");

export type Store = {
  resources: Record<string, unknown>;
  fetchedAt: Record<string, string>;
  signals: unknown[];
  notes: unknown[];
  lastCallAt?: string;
  lastCallResource?: string;
};

const empty: Store = { resources: {}, fetchedAt: {}, signals: [], notes: [] };

export async function readStore(): Promise<Store> {
  try { return { ...empty, ...JSON.parse(await fs.readFile(file, "utf8")) }; }
  catch { return { ...empty }; }
}

export async function writeStore(store: Store) {
  await fs.mkdir(dir, { recursive: true });
  const tmp = file + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, file);
}
