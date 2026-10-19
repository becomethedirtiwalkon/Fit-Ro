import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { authed, bad, clampImage, clampText } from "@/lib/api";

export const dynamic = "force-dynamic";

async function resolveClientId(
  role: string,
  userId: number,
  requested: string | null,
): Promise<number | null> {
  if (role === "admin") {
    const id = Number(requested);
    return id > 0 ? id : null;
  }
  return userId;
}

export async function GET(request: Request) {
  const { user, response } = await authed();
  if (!user) return response;

  const url = new URL(request.url);
  const clientId = await resolveClientId(user.role, user.id, url.searchParams.get("clientId"));
  if (!clientId) return bad("Elegí una conversación");

  const rows = await db
    .select({
      id: messages.id,
      body: messages.body,
      image: messages.image,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      senderName: users.name,
      senderRole: users.role,
      senderAvatar: users.avatar,
    })
    .from(messages)
    .innerJoin(users, eq(users.id, messages.senderId))
    .where(eq(messages.clientId, clientId))
    .orderBy(asc(messages.createdAt));

  const partnerRows =
    user.role === "admin"
      ? await db
          .select({ id: users.id, name: users.name, avatar: users.avatar, goal: users.goal })
          .from(users)
          .where(eq(users.id, clientId))
          .limit(1)
      : await db
          .select({ id: users.id, name: users.name, avatar: users.avatar, goal: users.goal })
          .from(users)
          .where(eq(users.role, "admin"))
          .limit(1);

  return NextResponse.json({ messages: rows, partner: partnerRows[0] ?? null });
}

export async function POST(request: Request) {
  const { user, response } = await authed();
  if (!user) return response;

  const payload = await request.json().catch(() => null);
  if (!payload) return bad("Datos inválidos");

  const clientId = await resolveClientId(user.role, user.id, String(payload.clientId ?? ""));
  if (!clientId) return bad("Elegí una conversación");

  const body = clampText(payload.body, 2000);
  const image = clampImage(payload.image);
  if (!body && !image) return bad("Escribí un mensaje");

  const [created] = await db
    .insert(messages)
    .values({ clientId, senderId: user.id, body, image })
    .returning();

  return NextResponse.json({ message: created });
}
