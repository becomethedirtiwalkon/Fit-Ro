import { redirect } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await ensureSeeded();
  const user = await getCurrentUser();
  if (user) redirect("/feed");
  return <AuthForm mode="login" />;
}
