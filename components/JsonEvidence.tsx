"use client";
import { useState } from "react";

function scalar(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "object") return Array.isArray(v) ? `Array(${v.length})` : "Object";
  return String(v);
}
function hasId(o: any) { return o && typeof o === "object" && (o.id || o._id || o.file_id || o.person_id || o.deal_id); }

export default function JsonEvidence({ data, title }: { data: unknown; title: string }) {
  const [open, setOpen] = useState(false);
  const json = JSON.stringify(data, null, 2) || "No data fetched yet.";
  const ids: string[] = [];
  function scan(v: any) {
    if (!v || typeof v !== "object") return;
    if (hasId(v)) ids.push(String(v.id || v._id || v.file_id || v.person_id || v.deal_id));
    Object.values(v).forEach(scan);
  }
  scan(data);
  return <section className="panel p-4">
    <div className="flex items-center justify-between gap-3">
      <div><div className="font-semibold">{title}</div><div className="muted text-xs mt-1">{ids.length} source identifiers detected</div></div>
      <button onClick={() => setOpen(!open)} className="pill">{open ? "Hide raw data" : "Inspect source data"}</button>
    </div>
    {ids.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{Array.from(new Set(ids)).slice(0, 16).map(id => <span className="pill" key={id}>ID: {id}</span>)}</div>}
    {open && <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-slate-300 whitespace-pre-wrap break-words">{json}</pre>}
  </section>;
}
