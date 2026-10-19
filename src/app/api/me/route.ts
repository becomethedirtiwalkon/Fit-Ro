import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { authed, clampImage, clampText } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const { user, response } = await authed();
  if (!user) return response;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const name = clampText(body.name, 80);
  const goal = clampText(body.goal, 120);
  const bio = clampText(body.bio, 280);
  const avatar = clampImage(body.avatar);

  const [updated] = await db
    .update(users)
    .set({
      ...(name ? { name } : {}),
      goal,
      bio,
      ...(avatar !== null ? { avatar } : {}),
    })
    .where(eq(users.id, user.id))
    .returning();

  return NextResponse.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar,
      goal: updated.goal,
      bio: updated.bio,
    },
  });
}
