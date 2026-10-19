import { redirect } from "next/navigation";

import StudioClient from "@/components/StudioClient";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/feed");
  return <StudioClient />;
}
