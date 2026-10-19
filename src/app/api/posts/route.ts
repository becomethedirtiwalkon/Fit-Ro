import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { adminOnly, authed, bad, clampImage, clampText } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, response } = await authed();
  if (!user) return response;

  const rows = await db
    .select({
      id: posts.id,
      kind: posts.kind,
      body: posts.body,
      image: posts.image,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
      authorRole: users.role,
      likeCount: sql<number>`(select count(*)::int from "likes" l where l.post_id = "posts".id)`,
      commentCount: sql<number>`(select count(*)::int from "comments" c where c.post_id = "posts".id)`,
      liked: sql<boolean>`exists (select 1 from "likes" lk where lk.post_id = "posts".id and lk.user_id = ${user.id})`,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .orderBy(desc(posts.createdAt))
    .limit(60);

  return NextResponse.json({ posts: rows });
}

export async function POST(request: Request) {
  const { user, response } = await adminOnly();
  if (!user) return response;

  const payload = await request.json().catch(() => null);
  if (!payload) return bad("Datos inválidos");

  const text = clampText(payload.body, 2000);
  const image = clampImage(payload.image);
  const kind = ["frase", "foto", "avance", "tip"].includes(payload.kind)
    ? (payload.kind as string)
    : "frase";

  if (!text && !image) return bad("Escribí algo o subí una foto");

  const [created] = await db
    .insert(posts)
    .values({ authorId: user.id, kind, body: text, image })
    .returning();

  return NextResponse.json({ post: created });
}

export async function DELETE(request: Request) {
  const { user, response } = await adminOnly();
  if (!user) return response;
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return bad("Falta el id");
  await db.delete(posts).where(eq(posts.id, id));
  return NextResponse.json({ ok: true });
}
