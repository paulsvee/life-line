import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, isAuthConfigured } from "../../../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const nextAuthHandler = NextAuth(authOptions);

export function GET(request, context) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ ok: false, error: "auth is not configured" }, { status: 503 });
  }

  return nextAuthHandler(request, context);
}

export function POST(request, context) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ ok: false, error: "auth is not configured" }, { status: 503 });
  }

  return nextAuthHandler(request, context);
}
