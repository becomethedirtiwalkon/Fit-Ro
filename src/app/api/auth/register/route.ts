import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { bad, clampText } from "@/lib/api";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = await request.json().catch(() => null);
  if (!body) return bad("Datos inválidos");

  const name = clampText(body.name, 80);
  const email = clampText(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const goal = clampText(body.goal, 120);

  if (name.length < 2) return bad("Contanos tu nombre");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return bad("Email inválido");
  if (password.length < 6) return bad("La contraseña necesita al menos 6 caracteres");

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) return bad("Ya existe una cuenta con ese email");

  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: hashPassword(password),
      role: "client",
      goal: goal || "Empezar a entrenar",
    })
    .returning();

  await createSession(created.id);

  return NextResponse.json({
    user: {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      avatar: created.avatar,
      goal: created.goal,
      bio: created.bio,
    },
  });
}
