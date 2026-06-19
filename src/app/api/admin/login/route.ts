import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminConfig } from "@/lib/env";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { password } = body;

  if (!adminConfig.password) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured." },
      { status: 500 }
    );
  }

  if (password !== adminConfig.password) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const store = await cookies();

  store.set(adminConfig.cookieName, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
