import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { checkins } from "@/db/schema";
import { authed, bad, clampText } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, response } = await authed();
  if (!user) return response;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(checkins)
    .where(eq(checkins.userId, user.id));

  return NextResponse.json({ total: count });
}

export async function POST(request: Request) {
  const { user, response } = await authed();
  if (!user) return response;

  const payload = await request.json().catch(() => null);
  const planId = Number(payload?.planId);
  const day = clampText(payload?.day, 90);
  if (!planId || !day) return bad("Datos inválidos");

  const existing = await db
    .select({ id: checkins.id })
    .from(checkins)
    .where(
      and(eq(checkins.planId, planId), eq(checkins.userId, user.id), eq(checkins.day, day)),
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(checkins).where(eq(checkins.id, existing[0].id));
    return NextResponse.json({ done: false });
  }

  await db.insert(checkins).values({ planId, userId: user.id, day });
  return NextResponse.json({ done: true });
}
