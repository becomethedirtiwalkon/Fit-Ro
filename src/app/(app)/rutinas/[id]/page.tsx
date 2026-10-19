import { redirect } from "next/navigation";

import PlanDetailClient from "@/components/PlanDetailClient";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  return <PlanDetailClient planId={Number(id)} user={user} />;
}
