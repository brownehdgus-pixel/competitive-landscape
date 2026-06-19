import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminConfig } from "@/lib/env";

export async function POST() {
  const store = await cookies();

  store.set(adminConfig.cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
