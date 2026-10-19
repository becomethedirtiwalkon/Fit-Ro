import { NextResponse } from "next/server";
import { desc, eq, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { plans, type PlanData } from "@/db/schema";
import { adminOnly, authed, bad, clampImage, clampText } from "@/lib/api";

export const dynamic = "force-dynamic";

function parseData(value: unknown): PlanData {
  if (!value || typeof value !== "object") return { blocks: [] };
  const blocks = (value as PlanData).blocks;
  if (!Array.isArray(blocks)) return { blocks: [] };
  return {
    blocks: blocks.slice(0, 14).map((block) => ({
      title: clampText(block?.title, 90) || "Bloque",
      subtitle: clampText(block?.subtitle, 120),
      items: Array.isArray(block?.items)
        ? block.items.slice(0, 30).map((item) => ({
            name: clampText(item?.name, 120),
            sets: clampText(item?.sets, 30),
            reps: clampText(item?.reps, 30),
            notes: clampText(item?.notes, 200),
          }))
        : [],
    })),
  };
}

export async function GET(request: Request) {
  const { user, response } = await authed();
  if (!user) return response;

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");

  const assignedFor = sql<boolean>`exists (select 1 from "assignments" a where a.plan_id = "plans".id and a.user_id = ${user.id})`;
  const assignedNote = sql<
    string | null
  >`(select an.note from "assignments" an where an.plan_id = "plans".id and an.user_id = ${user.id} limit 1)`;

  const base = db
    .select({
      id: plans.id,
      title: plans.title,
      summary: plans.summary,
      kind: plans.kind,
      level: plans.level,
      weeks: plans.weeks,
      cover: plans.cover,
      isPublic: plans.isPublic,
      createdAt: plans.createdAt,
      blockCount: sql<number>`jsonb_array_length(coalesce("plans".data -> 'blocks', '[]'::jsonb))`,
      assigned: assignedFor,
      assignedNote,
      assignedCount: sql<number>`(select count(*)::int from "assignments" ac where ac.plan_id = "plans".id)`,
    })
    .from(plans);

  const rows =
    user.role === "admin"
      ? await base.orderBy(desc(plans.createdAt))
      : await base.where(or(eq(plans.isPublic, true), assignedFor)).orderBy(desc(plans.createdAt));

  const filtered = kind ? rows.filter((row) => row.kind === kind) : rows;
  return NextResponse.json({ plans: filtered });
}

export async function POST(request: Request) {
  const { user, response } = await adminOnly();
  if (!user) return response;

  const payload = await request.json().catch(() => null);
  if (!payload) return bad("Datos inválidos");

  const title = clampText(payload.title, 90);
  if (!title) return bad("Poné un título a la rutina");

  const [created] = await db
    .insert(plans)
    .values({
      title,
      summary: clampText(payload.summary, 400),
      kind: payload.kind === "dieta" ? "dieta" : "rutina",
      level: clampText(payload.level, 40) || "Inicial",
      weeks: Number.isFinite(Number(payload.weeks)) ? Math.max(1, Math.min(52, Number(payload.weeks))) : 4,
      cover: clampImage(payload.cover),
      isPublic: payload.isPublic !== false,
      data: parseData(payload.data),
    })
    .returning();

  return NextResponse.json({ plan: created });
}
