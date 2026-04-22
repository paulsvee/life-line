import { NextResponse } from "next/server";
import { getLine } from "../../../lib/db";

export function GET() {
  const line = getLine("default");
  return NextResponse.json({ ok: true, line });
}
