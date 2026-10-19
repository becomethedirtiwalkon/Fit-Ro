import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { bad, clampText } from "@/lib/api";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = await request.json().catch(() => null);
  if (!body) return bad("Datos inválidos");

  const email = clampText(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return bad("Completá email y contraseña");

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return bad("Email o contraseña incorrectos", 401);
  }

  await createSession(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      goal: user.goal,
      bio: user.bio,
    },
  });
}
