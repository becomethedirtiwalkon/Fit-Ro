import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { progress } from "@/db/schema";
import { authed, bad, clampText } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, response } = await authed();
  if (!user) return response;

  const rows = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, user.id))
    .orderBy(desc(progress.createdAt))
    .limit(30);

  return NextResponse.json({ entries: rows });
}

export async function POST(request: Request) {
  const { user, response } = await authed();
  if (!user) return response;

  const payload = await request.json().catch(() => null);
  const weight = clampText(payload?.weight, 10);
  const note = clampText(payload?.note, 200);
  if (!weight && !note) return bad("Cargá un peso o una nota");

  const [created] = await db
    .insert(progress)
    .values({ userId: user.id, weight, note })
    .returning();

  return NextResponse.json({ entry: created });
}
