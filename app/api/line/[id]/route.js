import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAuthConfigured } from "../../../../lib/auth";
import { getLineForSession, saveLineForSession } from "../../../../lib/personal-line";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = isAuthConfigured() ? await getServerSession(authOptions) : null;
  const line = await getLineForSession(session);
  if (!line) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, line });
}

export async function PUT(request, { params }) {
  try {
    const session = isAuthConfigured() ? await getServerSession(authOptions) : null;
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const anchor = typeof body?.anchor === "string" && body.anchor.trim()
      ? body.anchor.trim()
      : "";
    const keywordsInput = typeof body?.keywordsInput === "string"
      ? body.keywordsInput
      : "";
    const keywords = keywordsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const safeChips = [anchor, ...keywords];
    const incomingColors = Array.isArray(body?.colors) ? body.colors : [];
    const safeColors = Array.from({ length: safeChips.length }, (_, index) => {
      const color = incomingColors[index];
      return typeof color === "string" && color ? color : null;
    });

    const line = await saveLineForSession(session, {
      id: params.id,
      anchor,
      keywordsInput,
      chips: safeChips,
      colors: safeColors,
    });

    return NextResponse.json({ ok: true, line });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }
}
