import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { assignments, checkins, plans, users } from "@/db/schema";
import { adminOnly, authed, bad } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await authed();
  if (!user) return response;

  const { id } = await params;
  const planId = Number(id);
  if (!planId) return bad("Plan inválido");

  const rows = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  const plan = rows[0];
  if (!plan) return bad("No encontramos ese plan", 404);

  const mine = await db
    .select({ note: assignments.note })
    .from(assignments)
    .where(and(eq(assignments.planId, planId), eq(assignments.userId, user.id)))
    .limit(1);

  if (!plan.isPublic && mine.length === 0 && user.role !== "admin") {
    return bad("Este plan es privado", 403);
  }

  const done = await db
    .select({ day: checkins.day })
    .from(checkins)
    .where(and(eq(checkins.planId, planId), eq(checkins.userId, user.id)));

  const assignedTo =
    user.role === "admin"
      ? await db
          .select({ id: users.id, name: users.name, avatar: users.avatar, note: assignments.note })
          .from(assignments)
          .innerJoin(users, eq(users.id, assignments.userId))
          .where(eq(assignments.planId, planId))
      : [];

  return NextResponse.json({
    plan,
    note: mine[0]?.note ?? null,
    assigned: mine.length > 0,
    completedDays: done.map((row) => row.day),
    assignedTo,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await adminOnly();
  if (!user) return response;
  const { id } = await params;
  const planId = Number(id);
  if (!planId) return bad("Plan inválido");
  await db.delete(plans).where(eq(plans.id, planId));
  return NextResponse.json({ ok: true });
}
