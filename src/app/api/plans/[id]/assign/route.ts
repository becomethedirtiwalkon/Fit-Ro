import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { assignments, messages, plans } from "@/db/schema";
import { adminOnly, bad, clampText } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await adminOnly();
  if (!user) return response;

  const { id } = await params;
  const planId = Number(id);
  const payload = await request.json().catch(() => null);
  const userId = Number(payload?.userId);
  const note = clampText(payload?.note, 300);
  if (!planId || !userId) return bad("Datos inválidos");

  const planRows = await db
    .select({ title: plans.title, kind: plans.kind })
    .from(plans)
    .where(eq(plans.id, planId))
    .limit(1);
  if (planRows.length === 0) return bad("Plan inexistente", 404);

  const existing = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(and(eq(assignments.planId, planId), eq(assignments.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(assignments).set({ note }).where(eq(assignments.id, existing[0].id));
  } else {
    await db.insert(assignments).values({ planId, userId, note });
    await db.insert(messages).values({
      clientId: userId,
      senderId: user.id,
      body: `Te envié ${planRows[0].kind === "dieta" ? "un plan de nutrición" : "una rutina"} nueva: «${planRows[0].title}». ${note || "Cualquier duda, me escribís por acá."}`,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await adminOnly();
  if (!user) return response;
  const { id } = await params;
  const planId = Number(id);
  const userId = Number(new URL(request.url).searchParams.get("userId"));
  if (!planId || !userId) return bad("Datos inválidos");

  await db
    .delete(assignments)
    .where(and(eq(assignments.planId, planId), eq(assignments.userId, userId)));

  return NextResponse.json({ ok: true });
}
