import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { likes } from "@/db/schema";
import { authed, bad } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await authed();
  if (!user) return response;

  const { id } = await params;
  const postId = Number(id);
  if (!postId) return bad("Post inválido");

  const existing = await db
    .select({ id: likes.id })
    .from(likes)
    .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(likes).where(eq(likes.id, existing[0].id));
  } else {
    await db.insert(likes).values({ postId, userId: user.id });
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(likes)
    .where(eq(likes.postId, postId));

  return NextResponse.json({ liked: existing.length === 0, likeCount: count });
}
