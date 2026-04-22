import { NextResponse } from "next/server";
import { getLine, saveLine } from "../../../../lib/db";

export function GET(_, { params }) {
  const line = getLine(params.id);
  if (!line) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, line });
}

export async function PUT(request, { params }) {
  try {
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

    const line = saveLine({
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
