import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { authed, bad, clampText } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await authed();
  if (!user) return response;
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return bad("Post inválido");

  const rows = await db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      userId: comments.userId,
      userName: users.name,
      userAvatar: users.avatar,
      userRole: users.role,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

  return NextResponse.json({ comments: rows });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await authed();
  if (!user) return response;
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return bad("Post inválido");

  const payload = await request.json().catch(() => null);
  const body = clampText(payload?.body, 600);
  if (!body) return bad("Escribí un comentario");

  await db.insert(comments).values({ postId, userId: user.id, body });

  return NextResponse.json({ ok: true });
}
