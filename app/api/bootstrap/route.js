import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { getLineForSession } from "../../../lib/personal-line";

export async function GET() {
  const session = await getServerSession(authOptions);
  const line = await getLineForSession(session);

  return NextResponse.json({
    ok: true,
    line,
    viewer: session?.user
      ? {
          authenticated: true,
          name: session.user.name || "",
          email: session.user.email || "",
          image: session.user.image || "",
        }
      : { authenticated: false },
    canWrite: !!session?.user,
  });
}
