import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json(await readStore()); }
