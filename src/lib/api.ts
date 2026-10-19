import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function authed(): Promise<
  { user: SessionUser; response: null } | { user: null; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: bad("No autorizado", 401) };
  }
  return { user, response: null };
}

export async function adminOnly(): Promise<
  { user: SessionUser; response: null } | { user: null; response: NextResponse }
> {
  const result = await authed();
  if (!result.user) return result;
  if (result.user.role !== "admin") {
    return { user: null, response: bad("Solo Rocío puede hacer esto", 403) };
  }
  return { user: result.user, response: null };
}

export function clampText(value: unknown, max = 4000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function clampImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 4_000_000) return null;
  return trimmed;
}
