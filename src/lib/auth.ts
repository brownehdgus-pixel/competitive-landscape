import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminConfig } from "@/lib/env";

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(adminConfig.cookieName)?.value === "authenticated";
}

export async function requireAdminOrReturn401(): Promise<NextResponse | null> {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json(
      { error: "Admin login required." },
      { status: 401 }
    );
  }

  return null;
}

export async function requireAdminOrThrow(): Promise<void> {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error("Admin login required.");
  }
}
