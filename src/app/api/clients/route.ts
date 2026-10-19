import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { adminOnly } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, response } = await adminOnly();
  if (!user) return response;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      goal: users.goal,
      createdAt: users.createdAt,
      planCount: sql<number>`(select count(*)::int from "assignments" a where a.user_id = "users".id)`,
      lastMessage: sql<
        string | null
      >`(select m.body from "messages" m where m.client_id = "users".id order by m.created_at desc limit 1)`,
      lastMessageAt: sql<
        string | null
      >`(select to_char(m2.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') from "messages" m2 where m2.client_id = "users".id order by m2.created_at desc limit 1)`,
      unread: sql<number>`(select count(*)::int from "messages" m3 where m3.client_id = "users".id and m3.sender_id = "users".id)`,
    })
    .from(users)
    .where(eq(users.role, "client"))
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ clients: rows });
}
