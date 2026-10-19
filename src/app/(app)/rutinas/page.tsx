import { redirect } from "next/navigation";

import RoutinesClient from "@/components/RoutinesClient";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RoutinesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <RoutinesClient user={user} />;
}
